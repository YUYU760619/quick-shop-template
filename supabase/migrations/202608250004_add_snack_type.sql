alter table public.products
  add column if not exists snack_type text;

alter table public.products
  drop constraint if exists products_snack_type_check;

alter table public.products
  add constraint products_snack_type_check
  check (snack_type is null or snack_type in ('餅乾', '泡麵', '飲料', '其他'));
