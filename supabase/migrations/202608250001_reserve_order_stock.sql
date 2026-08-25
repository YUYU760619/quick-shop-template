-- 下單時以原子操作保留庫存；取消訂單時只補回一次。
alter table public.orders
  add column if not exists stock_reserved boolean not null default false;

create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  new_order_number text;
  computed_subtotal numeric(12,0) := 0;
  item jsonb;
  product_record record;
  variant_record record;
  item_quantity integer;
  item_variant_id bigint;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception '購物車沒有商品'; end if;
  if coalesce(trim(p_customer->>'name'),'') = '' or coalesce(trim(p_customer->>'phone'),'') = '' or coalesce(trim(p_customer->>'email'),'') = '' or coalesce(trim(p_customer->>'address'),'') = '' then raise exception '訂購資料不完整'; end if;
  if (p_customer->>'delivery') not in ('宅配', '7-ELEVEN 店到店', '全家店到店') then raise exception '配送方式不正確'; end if;

  for item in select * from jsonb_array_elements(p_items) loop
    item_quantity := (item->>'quantity')::integer;
    if item_quantity < 1 then raise exception '商品數量不正確'; end if;
    select id, name, price, category, stock, size, is_active into product_record from public.products where id = (item->>'product_id')::bigint;
    if not found then raise exception '商品不存在'; end if;
    if not product_record.is_active then raise exception '商品已下架，無法建立訂單'; end if;
    item_variant_id := nullif(item->>'variant_id','')::bigint;
    if product_record.category = '服飾' then
      select id, color, size, stock into variant_record from public.product_variants where product_id = product_record.id and ((item_variant_id is not null and id = item_variant_id) or (item_variant_id is null and color = item->>'color' and size = item->>'size')) limit 1;
      if not found then raise exception '商品規格不存在'; end if;
    end if;
    computed_subtotal := computed_subtotal + product_record.price * item_quantity;
  end loop;

  new_order_number := 'GS' || to_char(now(), 'YYMMDDHH24MISS') || upper(substr(gen_random_uuid()::text, 1, 4));
  insert into public.orders (order_number, customer_name, phone, email, delivery_method, delivery_address, note, subtotal, stock_reserved)
  values (new_order_number, trim(p_customer->>'name'), trim(p_customer->>'phone'), trim(p_customer->>'email'), p_customer->>'delivery', trim(p_customer->>'address'), coalesce(p_customer->>'note',''), computed_subtotal, true)
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(p_items) loop
    item_quantity := (item->>'quantity')::integer;
    select id, name, price, category, size into product_record from public.products where id = (item->>'product_id')::bigint and is_active = true;
    if not found then raise exception '商品已下架，無法建立訂單'; end if;
    item_variant_id := nullif(item->>'variant_id','')::bigint;
    if product_record.category = '服飾' then
      update public.product_variants set stock = stock - item_quantity
        where product_id = product_record.id and stock >= item_quantity
          and ((item_variant_id is not null and id = item_variant_id) or (item_variant_id is null and color = item->>'color' and size = item->>'size'))
        returning id, color, size, stock into variant_record;
      if not found then raise exception '商品規格庫存不足'; end if;
      insert into public.order_items (order_id, product_id, variant_id, product_name, color, size, quantity, unit_price)
      values (new_order_id, product_record.id, variant_record.id, product_record.name, variant_record.color, variant_record.size, item_quantity, product_record.price);
    else
      update public.products set stock = stock - item_quantity where id = product_record.id and is_active = true and stock >= item_quantity;
      if not found then raise exception '商品庫存不足'; end if;
      insert into public.order_items (order_id, product_id, variant_id, product_name, color, size, quantity, unit_price)
      values (new_order_id, product_record.id, null, product_record.name, null, product_record.size, item_quantity, product_record.price);
    end if;
  end loop;

  return jsonb_build_object('id', new_order_id, 'order_number', new_order_number, 'subtotal', computed_subtotal);
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

create or replace function public.restore_cancelled_order_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item_record record;
begin
  if old.status = '取消' and new.status <> '取消' then raise exception '已取消訂單不可恢復，請重新建立訂單'; end if;
  if old.status is distinct from '取消' and new.status = '取消' and old.stock_reserved then
    for item_record in select product_id, variant_id, quantity from public.order_items where order_id = new.id loop
      if item_record.variant_id is not null then
        update public.product_variants set stock = stock + item_record.quantity where id = item_record.variant_id and product_id = item_record.product_id;
      else
        update public.products set stock = stock + item_record.quantity where id = item_record.product_id;
      end if;
    end loop;
    new.stock_reserved := false;
  end if;
  return new;
end;
$$;

drop trigger if exists restore_cancelled_order_stock_trigger on public.orders;
create trigger restore_cancelled_order_stock_trigger
before update of status on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.restore_cancelled_order_stock();
