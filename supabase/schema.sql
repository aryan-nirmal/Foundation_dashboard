-- Supabase setup script for Foundation Management Dashboard
-- Run inside the project's Supabase instance.

create extension if not exists "uuid-ossp";

create table if not exists residents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  gender text check (gender in ('Male', 'Female', 'Other')) not null,
  dob date,
  aadhar_no text unique,
  pan_no text unique,
  date_of_admission date not null,
  date_of_leaving date,
  remarks text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  employee_id text not null unique,
  name text not null,
  gender text check (gender in ('Male', 'Female', 'Other')) not null,
  age int check (age >= 18),
  department text not null,
  role text not null,
  date_of_joining date not null,
  salary numeric(12,2) check (salary >= 0),
  working_hours text,
  status text check (status in ('Active', 'Retired')) not null,
  performance_rating text check (performance_rating in ('Excellent', 'Good', 'Needs Support')) not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists caretakers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  age int check (age >= 18),
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists visitors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  contact_number text,
  age int,
  gender text check (gender in ('Male', 'Female', 'Other')),
  in_time time,
  out_time time,
  visit_date date not null,
  purpose text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  donor_name text not null,
  age int,
  amount numeric(12,2) check (amount >= 0),
  payment_method text check (payment_method in ('Cash', 'Online', 'Cheque')) not null,
  donation_date date not null,
  city text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists medical_records (
  id uuid primary key default uuid_generate_v4(),
  patient_name text not null,
  diagnosis text not null,
  gender text check (gender in ('Male', 'Female', 'Other')) not null,
  age int,
  record_date date not null,
  time_slot time,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_residents
before update on residents
for each row execute procedure set_updated_at();

create trigger set_timestamp_staff
before update on staff
for each row execute procedure set_updated_at();

create trigger set_timestamp_caretakers
before update on caretakers
for each row execute procedure set_updated_at();

create trigger set_timestamp_visitors
before update on visitors
for each row execute procedure set_updated_at();

create trigger set_timestamp_donations
before update on donations
for each row execute procedure set_updated_at();

create trigger set_timestamp_medical_records
before update on medical_records
for each row execute procedure set_updated_at();

