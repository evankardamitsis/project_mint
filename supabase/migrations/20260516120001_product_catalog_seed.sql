-- Seed product catalog templates (dev/staging; safe re-run via NOT EXISTS guards).

insert into public.brands (name, slug)
values
  ('Electro-Harmonix', 'electro-harmonix'),
  ('Strymon', 'strymon'),
  ('Chase Bliss', 'chase-bliss'),
  ('Universal Audio', 'universal-audio'),
  ('Neumann', 'neumann'),
  ('Shure', 'shure'),
  ('Technics', 'technics'),
  ('Pioneer', 'pioneer'),
  ('Marshall', 'marshall'),
  ('Vox', 'vox'),
  ('Mesa Boogie', 'mesa-boogie'),
  ('Orange', 'orange'),
  ('TC Electronic', 'tc-electronic'),
  ('Novation', 'novation'),
  ('Arturia', 'arturia'),
  ('Focusrite', 'focusrite'),
  ('Akai', 'akai'),
  ('Line 6', 'line-6'),
  ('PRS', 'prs'),
  ('Ernie Ball Music Man', 'ernie-ball-music-man'),
  ('Denon DJ', 'denon-dj'),
  ('Allen & Heath', 'allen-heath')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Category-level photo requirements & shipping (one-time per category slug)
-- ---------------------------------------------------------------------------

insert into public.product_photo_requirements (category_id, label, helper_text, required, sort_order)
select c.id, v.label, v.helper_text, v.required, v.sort_order
from public.categories c
cross join (
  values
    ('electric-guitars', 'Front photo', 'Full front of body, strings and pickups visible.', true, 0),
    ('electric-guitars', 'Back photo', 'Control cavity, neck plate, any buckle rash.', true, 1),
    ('electric-guitars', 'Headstock', 'Logo, tuners, nut; shows authenticity.', true, 2),
    ('electric-guitars', 'Serial number', 'Clear legible shot of serial.', true, 3),
    ('electric-guitars', 'Close-up blemishes', 'Dings, chips, fret wear — honesty builds trust.', true, 4),
    ('electric-guitars', 'Accessories / case', 'Case, tremolo arm, documents if included.', false, 5),
    ('effects-pedals', 'Top', 'Knobs, graphics, any scratches.', true, 0),
    ('effects-pedals', 'Bottom', 'Rubber feet, battery door, screws.', true, 1),
    ('effects-pedals', 'Serial number', 'Sticker or engraved serial.', true, 2),
    ('effects-pedals', 'Ports / jacks', 'Input/output sides, power jack.', true, 3),
    ('synths-keyboards', 'Front panel', 'Keys, controls, overall condition.', true, 0),
    ('synths-keyboards', 'Back / ports', 'MIDI, audio outs, power inlet.', true, 1),
    ('synths-keyboards', 'Serial number', 'Sticker or plate.', true, 2),
    ('synths-keyboards', 'Screen powered on', 'If applicable — proves display works.', false, 3),
    ('amps', 'Front', 'Grill, logo, control panel.', true, 0),
    ('amps', 'Back', 'Speaker outs, fuse, power section.', true, 1),
    ('amps', 'Speaker / cabinet', 'Speaker cone, surround, dust cap.', true, 2),
    ('amps', 'Serial number', 'Readable serial or date code.', true, 3),
    ('pro-audio', 'Front', 'Faceplate, meters, controls.', true, 0),
    ('pro-audio', 'Back', 'I/O, power, ventilation.', true, 1),
    ('pro-audio', 'Serial number', 'Legible serial.', true, 2),
    ('pro-audio', 'Accessories', 'Cables, shock mount, box if included.', false, 3),
    ('dj-gear', 'Front', 'Main controls and cosmetic condition.', true, 0),
    ('dj-gear', 'Back / ports', 'USB, RCA, power, faders from above if deck.', true, 1),
    ('dj-gear', 'Serial number', 'Sticker or engraving.', true, 2),
    ('dj-gear', 'Wear close-ups', 'Crossfader, jog wheels, pads.', true, 3),
    ('bass', 'Front photo', 'Body front, strings, pickups.', true, 0),
    ('bass', 'Back photo', 'Neck plate, control cavity.', true, 1),
    ('bass', 'Headstock', 'Logo and tuners.', true, 2),
    ('bass', 'Serial number', 'Clear serial shot.', true, 3),
    ('bass', 'Close-up blemishes', 'Fretboard wear, dings.', true, 4),
    ('bass', 'Accessories / case', 'Case or gig bag if included.', false, 5)
) as v (cat_slug, label, helper_text, required, sort_order)
where c.slug = v.cat_slug
  and not exists (
    select 1
    from public.product_photo_requirements pr
    where pr.category_id = c.id
      and pr.product_id is null
      and pr.label = v.label
  );

insert into public.product_shipping_profiles (
  category_id,
  package_length_cm,
  package_width_cm,
  package_height_cm,
  package_weight_kg,
  packaging_kit_label,
  packaging_notes
)
select c.id, v.l, v.w, v.h, v.kg, v.kit, v.notes
from public.categories c
cross join (
  values
    (
      'electric-guitars',
      110,
      40,
      15,
      5.5,
      'Guitar Kit',
      'Use stiff cardboard or hardshell case; pad headstock and bridge; loosen strings slightly for long trips.'
    ),
    (
      'effects-pedals',
      25,
      15,
      10,
      1.2,
      'Pedal Kit',
      'Wrap in bubble; immobilize knobs; small box with filler so the switch cannot be pressed in transit.'
    ),
    (
      'synths-keyboards',
      100,
      40,
      20,
      12.0,
      'Synth Kit',
      'Keys need side support; avoid pressure on knobs; original foam if available.'
    ),
    (
      'amps',
      55,
      50,
      35,
      18.0,
      'Amp Kit',
      'Heavy item — double-box; protect corners; tubes (if any) may need removal per courier rules.'
    ),
    (
      'pro-audio',
      45,
      35,
      25,
      6.0,
      'Audio Kit',
      'Anti-static bag for sensitive electronics; shock padding; mark fragile.'
    ),
    (
      'dj-gear',
      55,
      45,
      25,
      10.0,
      'DJ Kit',
      'Protect platters and faders; lock tonearms if turntable; original packing ideal.'
    ),
    (
      'bass',
      115,
      42,
      16,
      6.0,
      'Guitar Kit',
      'Same guidance as electric guitar; bass necks need extra support.'
    )
) as v (cat_slug, l, w, h, kg, kit, notes)
where c.slug = v.cat_slug
  and not exists (
    select 1
    from public.product_shipping_profiles ps
    where ps.category_id = c.id
      and ps.product_id is null
  );

-- ---------------------------------------------------------------------------
-- Products + aliases + price estimates (manual_seed; not a live pricing engine)
-- ---------------------------------------------------------------------------

-- Helper pattern: insert product if missing, then aliases and prices by slug.

insert into public.products (
  category_id,
  brand_id,
  name,
  slug,
  model,
  default_title_template,
  description_prompt,
  protected_delivery_recommended
)
select c.id, b.id, 'Stratocaster', 'fender-stratocaster', 'Stratocaster',
  'Fender Stratocaster',
  'Include year or series if known, pickup types, fret condition, tremolo setup, finish flaws, and what is included (case, tools).',
  true
from public.categories c
cross join public.brands b
where c.slug = 'electric-guitars'
  and b.slug = 'fender'
  and not exists (select 1 from public.products p where p.slug = 'fender-stratocaster');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Les Paul Studio', 'gibson-les-paul-studio', 'Les Paul Studio', 'Gibson Les Paul Studio',
  'Note weight relief if any, neck profile, pickup upgrades, buckle rash, and electronics noise.',
  true
from public.categories c cross join public.brands b
where c.slug = 'electric-guitars' and b.slug = 'gibson'
  and not exists (select 1 from public.products p where p.slug = 'gibson-les-paul-studio');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Telecaster', 'fender-telecaster', 'Telecaster', 'Fender Telecaster',
  'Ash vs alder if known, bridge type, neck pocket fit, fret life, and included case.',
  true
from public.categories c cross join public.brands b
where c.slug = 'electric-guitars' and b.slug = 'fender'
  and not exists (select 1 from public.products p where p.slug = 'fender-telecaster');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'RG Prestige', 'ibanez-rg-prestige', 'RG Prestige', 'Ibanez RG Prestige',
  'Floyd setup, fretboard wood, tremolo accessories, chip on horn tips, factory case.',
  true
from public.categories c cross join public.brands b
where c.slug = 'electric-guitars' and b.slug = 'ibanez'
  and not exists (select 1 from public.products p where p.slug = 'ibanez-rg-prestige');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SG Standard', 'gibson-sg-standard', 'SG Standard', 'Gibson SG Standard',
  'Headstock repair history, neck dive, pickup height, scratchplate cracks.',
  true
from public.categories c cross join public.brands b
where c.slug = 'electric-guitars' and b.slug = 'gibson'
  and not exists (select 1 from public.products p where p.slug = 'gibson-sg-standard');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Silver Sky', 'prs-silver-sky', 'Silver Sky', 'PRS Silver Sky',
  'Tremolo block, nut material, fret sprout, original gig bag.',
  true
from public.categories c cross join public.brands b
where c.slug = 'electric-guitars' and b.slug = 'prs'
  and not exists (select 1 from public.products p where p.slug = 'prs-silver-sky');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'CE-2 Chorus', 'boss-ce-2-chorus', 'CE-2', 'Boss CE-2 Chorus',
  'Waza vs vintage, power supply type, pot codes if known, any mod or recap.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'boss'
  and not exists (select 1 from public.products p where p.slug = 'boss-ce-2-chorus');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Big Muff Pi', 'ehx-big-muff-pi', 'Big Muff Pi', 'Electro-Harmonix Big Muff Pi',
  'Version / era, true bypass, power jack, velcro residue.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'electro-harmonix'
  and not exists (select 1 from public.products p where p.slug = 'ehx-big-muff-pi');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Timeline', 'strymon-timeline', 'Timeline', 'Strymon Timeline',
  'Firmware version, power draw, MIDI setup, box and manual.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'strymon'
  and not exists (select 1 from public.products p where p.slug = 'strymon-timeline');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Mood', 'chase-bliss-mood', 'Mood', 'Chase Bliss Mood',
  'Dip switches, preset count, velcro, include box and manual if you have them.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'chase-bliss'
  and not exists (select 1 from public.products p where p.slug = 'chase-bliss-mood');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Flashback 2 Delay', 'tc-electronic-flashback-2', 'Flashback 2', 'TC Electronic Flashback 2',
  'TonePrint slots, USB, power supply included or not.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'tc-electronic'
  and not exists (select 1 from public.products p where p.slug = 'tc-electronic-flashback-2');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Helix LT', 'line-6-helix-lt', 'Helix LT', 'Line 6 Helix LT',
  'Firmware, footswitch feel, screen protector, flight case or bag.',
  true
from public.categories c cross join public.brands b
where c.slug = 'effects-pedals' and b.slug = 'line-6'
  and not exists (select 1 from public.products p where p.slug = 'line-6-helix-lt');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SH-101', 'roland-sh-101', 'SH-101', 'Roland SH-101',
  'Mod grip, battery door cracks, internal leaking caps serviced?, power adapter.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'roland'
  and not exists (select 1 from public.products p where p.slug = 'roland-sh-101');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Minilogue XD', 'korg-minilogue-xd', 'Minilogue XD', 'Korg Minilogue XD',
  'Custom oscillators loaded, keybed tilt, power supply, dust cover.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'korg'
  and not exists (select 1 from public.products p where p.slug = 'korg-minilogue-xd');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Subsequent 37', 'moog-subsequent-37', 'Subsequent 37', 'Moog Subsequent 37',
  'Aftertouch calibration, firmware, road case, humidity exposure.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'moog'
  and not exists (select 1 from public.products p where p.slug = 'moog-subsequent-37');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'DX7', 'yamaha-dx7', 'DX7', 'Yamaha DX7',
  'Battery replaced?, cartridge banks, noisy output jacks, LCD contrast.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'yamaha'
  and not exists (select 1 from public.products p where p.slug = 'yamaha-dx7');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Peak', 'novation-peak', 'Peak', 'Novation Peak',
  'Desktop vs rack ears, digital noise floor, OS version.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'novation'
  and not exists (select 1 from public.products p where p.slug = 'novation-peak');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'KeyLab 61 MKII', 'arturia-keylab-61-mkii', 'KeyLab 61 MKII', 'Arturia KeyLab 61 MKII',
  'Pads sensitivity, Analog Lab license transfer note, box.',
  false
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'arturia'
  and not exists (select 1 from public.products p where p.slug = 'arturia-keylab-61-mkii');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'MS-20 mini', 'korg-ms-20-mini', 'MS-20 mini', 'Korg MS-20 mini',
  'Patch cables included, scratch on side panels, power supply.',
  true
from public.categories c cross join public.brands b
where c.slug = 'synths-keyboards' and b.slug = 'korg'
  and not exists (select 1 from public.products p where p.slug = 'korg-ms-20-mini');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Blues Junior IV', 'fender-blues-junior-iv', 'Blues Junior IV', 'Fender Blues Junior IV',
  'Speaker swap?, tube brand, hum at idle, reverb tank rattle.',
  true
from public.categories c cross join public.brands b
where c.slug = 'amps' and b.slug = 'fender'
  and not exists (select 1 from public.products p where p.slug = 'fender-blues-junior-iv');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'AC15C1', 'vox-ac15c1', 'AC15C1', 'Vox AC15C1',
  'Green vs blue vs Celestion, master volume mod, tube set.',
  true
from public.categories c cross join public.brands b
where c.slug = 'amps' and b.slug = 'vox'
  and not exists (select 1 from public.products p where p.slug = 'vox-ac15c1');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'DSL40CR', 'marshall-dsl40cr', 'DSL40CR', 'Marshall DSL40CR',
  'Reverb tank, footswitch, casters, any scratch on tolex.',
  true
from public.categories c cross join public.brands b
where c.slug = 'amps' and b.slug = 'marshall'
  and not exists (select 1 from public.products p where p.slug = 'marshall-dsl40cr');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Mark V 25', 'mesa-boogie-mark-v-25', 'Mark Five: 25', 'Mesa Boogie Mark V:25',
  'Tube set, footswitch, fan noise, FX loop level.',
  true
from public.categories c cross join public.brands b
where c.slug = 'amps' and b.slug = 'mesa-boogie'
  and not exists (select 1 from public.products p where p.slug = 'mesa-boogie-mark-v-25');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Rockerverb 50 MKIII', 'orange-rockerverb-50-mkiii', 'Rockerverb 50 MKIII', 'Orange Rockerverb 50 MKIII',
  'Head vs combo, tube bias service history, footswitch.',
  true
from public.categories c cross join public.brands b
where c.slug = 'amps' and b.slug = 'orange'
  and not exists (select 1 from public.products p where p.slug = 'orange-rockerverb-50-mkiii');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'U 87 Ai', 'neumann-u87-ai', 'U 87 Ai', 'Neumann U 87 Ai',
  'Shock mount, capsule dents, self-noise, original wooden box.',
  true
from public.categories c cross join public.brands b
where c.slug = 'pro-audio' and b.slug = 'neumann'
  and not exists (select 1 from public.products p where p.slug = 'neumann-u87-ai');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SM7B', 'shure-sm7b', 'SM7B', 'Shure SM7B',
  'Yoke wear, foam intact, cloudlifter pairing note.',
  true
from public.categories c cross join public.brands b
where c.slug = 'pro-audio' and b.slug = 'shure'
  and not exists (select 1 from public.products p where p.slug = 'shure-sm7b');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Apollo Twin X Duo', 'ua-apollo-twin-x-duo', 'Apollo Twin X Duo', 'Universal Audio Apollo Twin X Duo',
  'Thunderbolt vs USB, plugin bundle, fan noise, registration transfer.',
  true
from public.categories c cross join public.brands b
where c.slug = 'pro-audio' and b.slug = 'universal-audio'
  and not exists (select 1 from public.products p where p.slug = 'ua-apollo-twin-x-duo');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Scarlett 2i2 (3rd Gen)', 'focusrite-scarlett-2i2-gen3', 'Scarlett 2i2', 'Focusrite Scarlett 2i2 (3rd Gen)',
  'USB-C cable, registration, phantom pop on channel 1.',
  true
from public.categories c cross join public.brands b
where c.slug = 'pro-audio' and b.slug = 'focusrite'
  and not exists (select 1 from public.products p where p.slug = 'focusrite-scarlett-2i2-gen3');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'HS8 (pair)', 'yamaha-hs8-pair', 'HS8', 'Yamaha HS8 (pair)',
  'Matched pair?, grill dents, amp hours, power cables.',
  true
from public.categories c cross join public.brands b
where c.slug = 'pro-audio' and b.slug = 'yamaha'
  and not exists (select 1 from public.products p where p.slug = 'yamaha-hs8-pair');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SL-1200MK2', 'technics-sl-1200mk2', 'SL-1200MK2', 'Technics SL-1200MK2',
  'Pitch stability, tonearm bearing, RCA mod, dust cover cracks.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'technics'
  and not exists (select 1 from public.products p where p.slug = 'technics-sl-1200mk2');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'DJM-750MK2', 'pioneer-djm-750mk2', 'DJM-750MK2', 'Pioneer DJM-750MK2',
  'Crossfader curve, channel faders, Rekordbox unlock.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'pioneer'
  and not exists (select 1 from public.products p where p.slug = 'pioneer-djm-750mk2');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'DDJ-400', 'pioneer-ddj-400', 'DDJ-400', 'Pioneer DDJ-400',
  'Rekordbox license, jog tension, fader bleed.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'pioneer'
  and not exists (select 1 from public.products p where p.slug = 'pioneer-ddj-400');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'MPC One', 'akai-mpc-one', 'MPC One', 'Akai MPC One',
  'SD card, pads sensitivity, standoffs, fan whine.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'akai'
  and not exists (select 1 from public.products p where p.slug = 'akai-mpc-one');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SC6000 Prime', 'denon-sc6000-prime', 'SC6000 Prime', 'Denon DJ SC6000 Prime',
  'SSD size, platter tension, Engine Prime version.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'denon-dj'
  and not exists (select 1 from public.products p where p.slug = 'denon-sc6000-prime');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Xone:92', 'allen-heath-xone-92', 'Xone:92', 'Allen & Heath Xone:92',
  'Crossfader type, VCF scratchy pots, flight case.',
  true
from public.categories c cross join public.brands b
where c.slug = 'dj-gear' and b.slug = 'allen-heath'
  and not exists (select 1 from public.products p where p.slug = 'allen-heath-xone-92');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'StingRay Special 4H', 'ernie-ball-music-man-stingray-4h', 'StingRay Special', 'Ernie Ball Music Man StingRay Special 4H',
  'Neck relief, preamp noise, battery box, case.',
  true
from public.categories c cross join public.brands b
where c.slug = 'bass' and b.slug = 'ernie-ball-music-man'
  and not exists (select 1 from public.products p where p.slug = 'ernie-ball-music-man-stingray-4h');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'Player Jazz Bass', 'fender-player-jazz-bass', 'Player Jazz Bass', 'Fender Player Jazz Bass',
  'Fret ends, pickup height, weight, gig bag.',
  true
from public.categories c cross join public.brands b
where c.slug = 'bass' and b.slug = 'fender'
  and not exists (select 1 from public.products p where p.slug = 'fender-player-jazz-bass');

insert into public.products (category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended)
select c.id, b.id, 'SR505E', 'ibanez-sr505e', 'SR505E', 'Ibanez SR505E',
  'Prestige electronics, neck dive, string gauge, case.',
  true
from public.categories c cross join public.brands b
where c.slug = 'bass' and b.slug = 'ibanez'
  and not exists (select 1 from public.products p where p.slug = 'ibanez-sr505e');

-- Aliases (skip if exists for product+alias)
insert into public.product_aliases (product_id, alias)
select p.id, v.alias
from public.products p
cross join (values
  ('fender-stratocaster', 'Strat'),
  ('fender-stratocaster', 'Fender Strat'),
  ('gibson-les-paul-studio', 'Les Paul'),
  ('fender-telecaster', 'Tele'),
  ('ibanez-rg-prestige', 'RG'),
  ('boss-ce-2-chorus', 'CE-2'),
  ('ehx-big-muff-pi', 'Big Muff'),
  ('strymon-timeline', 'Timeline delay'),
  ('chase-bliss-mood', 'Mood mkII'),
  ('roland-sh-101', 'SH101'),
  ('korg-minilogue-xd', 'Minilogue'),
  ('moog-subsequent-37', 'Sub 37'),
  ('yamaha-dx7', 'DX-7'),
  ('fender-blues-junior-iv', 'Blues Jr'),
  ('vox-ac15c1', 'AC15'),
  ('marshall-dsl40cr', 'DSL40'),
  ('neumann-u87-ai', 'U87'),
  ('shure-sm7b', 'SM7'),
  ('ua-apollo-twin-x-duo', 'Apollo Twin'),
  ('technics-sl-1200mk2', '1200'),
  ('pioneer-djm-750mk2', 'DJM750'),
  ('line-6-helix-lt', 'Helix'),
  ('prs-silver-sky', 'Silver Sky John Mayer')
) as v (slug, alias)
where p.slug = v.slug
  and not exists (
    select 1 from public.product_aliases pa
    where pa.product_id = p.id and lower(pa.alias) = lower(v.alias)
  );

-- Price estimates: excellent / very_good / good (illustrative ranges, EUR cents)
insert into public.product_price_estimates (product_id, condition, low_price_cents, high_price_cents, median_price_cents, sample_size, source)
select p.id, v.condition::public.listing_condition, v.lo, v.hi, v.med, v.n, 'manual_seed'
from public.products p
cross join (
  values
    ('fender-stratocaster', 'excellent', 65000, 110000, 88000, 120),
    ('fender-stratocaster', 'very_good', 52000, 90000, 72000, 140),
    ('fender-stratocaster', 'good', 40000, 75000, 58000, 90),
    ('gibson-les-paul-studio', 'excellent', 90000, 140000, 115000, 80),
    ('gibson-les-paul-studio', 'very_good', 70000, 120000, 95000, 95),
    ('gibson-les-paul-studio', 'good', 55000, 95000, 72000, 60),
    ('fender-telecaster', 'excellent', 60000, 105000, 82000, 100),
    ('fender-telecaster', 'very_good', 48000, 88000, 65000, 110),
    ('fender-telecaster', 'good', 38000, 70000, 52000, 70),
    ('ibanez-rg-prestige', 'excellent', 110000, 180000, 145000, 40),
    ('ibanez-rg-prestige', 'very_good', 90000, 150000, 118000, 55),
    ('ibanez-rg-prestige', 'good', 70000, 120000, 92000, 35),
    ('boss-ce-2-chorus', 'excellent', 18000, 35000, 26000, 200),
    ('boss-ce-2-chorus', 'very_good', 12000, 28000, 19000, 220),
    ('boss-ce-2-chorus', 'good', 8000, 20000, 13000, 150),
    ('ehx-big-muff-pi', 'excellent', 7000, 16000, 11000, 300),
    ('ehx-big-muff-pi', 'very_good', 5000, 12000, 8000, 280),
    ('ehx-big-muff-pi', 'good', 3500, 9000, 6000, 200),
    ('strymon-timeline', 'excellent', 35000, 48000, 41000, 90),
    ('strymon-timeline', 'very_good', 28000, 42000, 34000, 100),
    ('strymon-timeline', 'good', 22000, 35000, 28000, 70),
    ('chase-bliss-mood', 'excellent', 28000, 38000, 32500, 45),
    ('chase-bliss-mood', 'very_good', 22000, 32000, 27000, 50),
    ('chase-bliss-mood', 'good', 18000, 28000, 22000, 30),
    ('roland-sh-101', 'excellent', 140000, 220000, 175000, 25),
    ('roland-sh-101', 'very_good', 110000, 180000, 145000, 30),
    ('roland-sh-101', 'good', 85000, 140000, 110000, 20),
    ('korg-minilogue-xd', 'excellent', 45000, 65000, 55000, 85),
    ('korg-minilogue-xd', 'very_good', 38000, 55000, 46000, 95),
    ('korg-minilogue-xd', 'good', 30000, 45000, 37000, 70),
    ('moog-subsequent-37', 'excellent', 130000, 170000, 150000, 35),
    ('moog-subsequent-37', 'very_good', 110000, 150000, 130000, 40),
    ('moog-subsequent-37', 'good', 90000, 130000, 108000, 25),
    ('yamaha-dx7', 'excellent', 35000, 70000, 52000, 40),
    ('yamaha-dx7', 'very_good', 28000, 55000, 40000, 45),
    ('yamaha-dx7', 'good', 20000, 42000, 30000, 35),
    ('fender-blues-junior-iv', 'excellent', 45000, 65000, 55000, 60),
    ('fender-blues-junior-iv', 'very_good', 38000, 55000, 46000, 70),
    ('fender-blues-junior-iv', 'good', 30000, 48000, 38000, 50),
    ('vox-ac15c1', 'excellent', 50000, 75000, 62000, 55),
    ('vox-ac15c1', 'very_good', 42000, 65000, 52000, 65),
    ('vox-ac15c1', 'good', 35000, 55000, 44000, 45),
    ('marshall-dsl40cr', 'excellent', 55000, 80000, 67000, 50),
    ('marshall-dsl40cr', 'very_good', 45000, 70000, 56000, 60),
    ('marshall-dsl40cr', 'good', 38000, 60000, 48000, 40),
    ('neumann-u87-ai', 'excellent', 220000, 320000, 270000, 15),
    ('neumann-u87-ai', 'very_good', 180000, 260000, 220000, 18),
    ('neumann-u87-ai', 'good', 140000, 210000, 175000, 12),
    ('shure-sm7b', 'excellent', 32000, 45000, 38000, 400),
    ('shure-sm7b', 'very_good', 26000, 38000, 32000, 450),
    ('shure-sm7b', 'good', 22000, 32000, 27000, 300),
    ('ua-apollo-twin-x-duo', 'excellent', 70000, 95000, 82000, 70),
    ('ua-apollo-twin-x-duo', 'very_good', 58000, 82000, 69000, 80),
    ('ua-apollo-twin-x-duo', 'good', 48000, 70000, 58000, 55),
    ('technics-sl-1200mk2', 'excellent', 90000, 150000, 120000, 30),
    ('technics-sl-1200mk2', 'very_good', 70000, 120000, 95000, 35),
    ('technics-sl-1200mk2', 'good', 55000, 95000, 75000, 25),
    ('pioneer-djm-750mk2', 'excellent', 80000, 120000, 100000, 25),
    ('pioneer-djm-750mk2', 'very_good', 65000, 100000, 82000, 30),
    ('pioneer-djm-750mk2', 'good', 52000, 85000, 68000, 20)
) as v (slug, condition, lo, hi, med, n)
where p.slug = v.slug
  and not exists (
    select 1
    from public.product_price_estimates e
    where e.product_id = p.id
      and e.condition = v.condition::public.listing_condition
  );

-- More price rows for remaining slugs
insert into public.product_price_estimates (product_id, condition, low_price_cents, high_price_cents, median_price_cents, sample_size, source)
select p.id, v.condition::public.listing_condition, v.lo, v.hi, v.med, v.n, 'manual_seed'
from public.products p
cross join (
  values
    ('gibson-sg-standard', 'excellent', 95000, 150000, 120000, 40),
    ('gibson-sg-standard', 'very_good', 75000, 120000, 95000, 50),
    ('gibson-sg-standard', 'good', 60000, 95000, 78000, 35),
    ('prs-silver-sky', 'excellent', 180000, 240000, 210000, 25),
    ('prs-silver-sky', 'very_good', 150000, 200000, 175000, 30),
    ('prs-silver-sky', 'good', 120000, 170000, 145000, 20),
    ('tc-electronic-flashback-2', 'excellent', 9000, 16000, 12000, 150),
    ('tc-electronic-flashback-2', 'very_good', 7000, 13000, 9500, 160),
    ('tc-electronic-flashback-2', 'good', 5000, 10000, 7500, 120),
    ('line-6-helix-lt', 'excellent', 85000, 115000, 99000, 40),
    ('line-6-helix-lt', 'very_good', 70000, 100000, 85000, 45),
    ('line-6-helix-lt', 'good', 58000, 85000, 70000, 30),
    ('novation-peak', 'excellent', 90000, 130000, 110000, 20),
    ('novation-peak', 'very_good', 75000, 110000, 92000, 25),
    ('novation-peak', 'good', 62000, 95000, 78000, 18),
    ('arturia-keylab-61-mkii', 'excellent', 45000, 65000, 55000, 35),
    ('arturia-keylab-61-mkii', 'very_good', 38000, 55000, 46000, 40),
    ('arturia-keylab-61-mkii', 'good', 30000, 45000, 37000, 28),
    ('korg-ms-20-mini', 'excellent', 45000, 65000, 55000, 50),
    ('korg-ms-20-mini', 'very_good', 38000, 55000, 46000, 55),
    ('korg-ms-20-mini', 'good', 30000, 48000, 38000, 40),
    ('mesa-boogie-mark-v-25', 'excellent', 140000, 190000, 165000, 15),
    ('mesa-boogie-mark-v-25', 'very_good', 120000, 165000, 140000, 18),
    ('mesa-boogie-mark-v-25', 'good', 100000, 140000, 118000, 12),
    ('orange-rockerverb-50-mkiii', 'excellent', 130000, 180000, 155000, 18),
    ('orange-rockerverb-50-mkiii', 'very_good', 110000, 150000, 130000, 22),
    ('orange-rockerverb-50-mkiii', 'good', 90000, 130000, 108000, 15),
    ('focusrite-scarlett-2i2-gen3', 'excellent', 9000, 14000, 11500, 200),
    ('focusrite-scarlett-2i2-gen3', 'very_good', 7000, 12000, 9500, 220),
    ('focusrite-scarlett-2i2-gen3', 'good', 5500, 9500, 7500, 180),
    ('yamaha-hs8-pair', 'excellent', 50000, 70000, 60000, 30),
    ('yamaha-hs8-pair', 'very_good', 42000, 60000, 51000, 35),
    ('yamaha-hs8-pair', 'good', 35000, 52000, 43000, 25),
    ('pioneer-ddj-400', 'excellent', 22000, 32000, 27000, 120),
    ('pioneer-ddj-400', 'very_good', 18000, 28000, 23000, 140),
    ('pioneer-ddj-400', 'good', 15000, 24000, 19000, 100),
    ('akai-mpc-one', 'excellent', 55000, 75000, 65000, 40),
    ('akai-mpc-one', 'very_good', 48000, 65000, 56000, 45),
    ('akai-mpc-one', 'good', 40000, 58000, 48000, 35),
    ('denon-sc6000-prime', 'excellent', 110000, 150000, 130000, 12),
    ('denon-sc6000-prime', 'very_good', 95000, 130000, 112000, 15),
    ('denon-sc6000-prime', 'good', 80000, 110000, 95000, 10),
    ('allen-heath-xone-92', 'excellent', 90000, 140000, 115000, 20),
    ('allen-heath-xone-92', 'very_good', 75000, 120000, 95000, 25),
    ('allen-heath-xone-92', 'good', 60000, 95000, 78000, 18),
    ('ernie-ball-music-man-stingray-4h', 'excellent', 140000, 200000, 170000, 22),
    ('ernie-ball-music-man-stingray-4h', 'very_good', 120000, 170000, 145000, 28),
    ('ernie-ball-music-man-stingray-4h', 'good', 95000, 140000, 118000, 20),
    ('fender-player-jazz-bass', 'excellent', 65000, 90000, 78000, 55),
    ('fender-player-jazz-bass', 'very_good', 55000, 78000, 65000, 60),
    ('fender-player-jazz-bass', 'good', 45000, 65000, 55000, 45),
    ('ibanez-sr505e', 'excellent', 75000, 110000, 92000, 25),
    ('ibanez-sr505e', 'very_good', 62000, 95000, 78000, 30),
    ('ibanez-sr505e', 'good', 50000, 80000, 65000, 20)
) as v (slug, condition, lo, hi, med, n)
where p.slug = v.slug
  and not exists (
    select 1
    from public.product_price_estimates e
    where e.product_id = p.id
      and e.condition = v.condition::public.listing_condition
  );
