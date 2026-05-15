-- Galaksi Aromatica POS PostgreSQL schema untuk Lovable/Supabase.
-- Jalankan di Supabase SQL Editor kalau mau backend beneran.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  role text not null check (role in ('admin','kasir')),
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price integer not null default 0,
  image_url text,
  is_active boolean default true,
  is_best_seller boolean default false,
  is_promo boolean default false,
  stock integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  price_adjustment integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  price integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  cashier_id uuid references profiles(id) on delete set null,
  customer_name text,
  order_type text not null check (order_type in ('Dine In','Take Away')),
  table_number text,
  queue_number integer,
  subtotal integer not null default 0,
  discount integer not null default 0,
  tax_amount integer not null default 0,
  service_charge_amount integer not null default 0,
  total integer not null default 0,
  payment_method text not null check (payment_method in ('cash','qris')),
  payment_status text not null check (payment_status in ('pending','paid','failed','expired')),
  payment_reference text,
  amount_paid integer,
  change_amount integer,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  variant_snapshot jsonb default 'null'::jsonb,
  addon_snapshot jsonb default '[]'::jsonb,
  note text,
  price_snapshot integer not null default 0,
  quantity integer not null default 1,
  total integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists payment_logs (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  gateway_name text not null,
  gateway_reference text,
  raw_payload jsonb not null,
  status text not null,
  created_at timestamptz default now()
);

create table if not exists store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Galaksi Aromatica',
  logo_url text,
  address text,
  phone text,
  instagram text,
  receipt_footer text default 'Terima kasih sudah mampir di Galaksi Aromatica',
  receipt_size text default '80mm' check (receipt_size in ('58mm','80mm')),
  tax_enabled boolean default true,
  tax_percentage numeric default 10,
  service_charge_enabled boolean default false,
  service_charge_percentage numeric default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists held_orders (
  id uuid primary key default gen_random_uuid(),
  cashier_id uuid references profiles(id) on delete set null,
  customer_name text,
  order_type text not null check (order_type in ('Dine In','Take Away')),
  table_number text,
  cart_payload jsonb not null,
  created_at timestamptz default now()
);

-- RLS contoh kasar. Sesuaikan lagi di Supabase/Lovable sesuai auth project-mu.
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table payment_logs enable row level security;
alter table store_settings enable row level security;
alter table held_orders enable row level security;
