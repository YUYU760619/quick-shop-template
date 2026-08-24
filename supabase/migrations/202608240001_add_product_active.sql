alter table public.products
  add column if not exists is_active boolean not null default true;

create index if not exists products_is_active_created_at_idx
  on public.products(is_active, created_at desc);

create or replace function public.ensure_order_item_product_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.products
    where id = new.product_id and is_active = true
  ) then
    raise exception '商品已下架，無法建立訂單';
  end if;
  return new;
end;
$$;

drop trigger if exists ensure_order_item_product_active_trigger on public.order_items;
create trigger ensure_order_item_product_active_trigger
before insert or update of product_id on public.order_items
for each row execute function public.ensure_order_item_product_active();
