-- Seed categories and brands for Project Mint (Greece music gear focus).

insert into public.categories (name, slug, parent_id)
values
  ('Electric Guitars', 'electric-guitars', null),
  ('Acoustic Guitars', 'acoustic-guitars', null),
  ('Bass', 'bass', null),
  ('Effects & Pedals', 'effects-pedals', null),
  ('Amps', 'amps', null),
  ('Synths & Keyboards', 'synths-keyboards', null),
  ('Pro Audio', 'pro-audio', null),
  ('DJ Gear', 'dj-gear', null),
  ('Drums', 'drums', null),
  ('Accessories', 'accessories', null)
on conflict (slug) do nothing;

insert into public.brands (name, slug)
values
  ('Fender', 'fender'),
  ('Gibson', 'gibson'),
  ('Ibanez', 'ibanez'),
  ('Yamaha', 'yamaha'),
  ('Roland', 'roland'),
  ('Korg', 'korg'),
  ('Boss', 'boss'),
  ('Moog', 'moog')
on conflict (slug) do nothing;
