-- Seed data for CoschapReview.
-- Runs automatically on `npx supabase db reset`.
--
-- IMPORTANT: change the admin email on the final INSERT to your own
-- address before testing.

insert into public.courses (slug, title, location, description, studiegids_url, color, type_id) values
  ('jansen-amersfoort', 'Apotheek Jansen Amersfoort',
   'Amersfoort',
   'Openbare apotheek met veel baliewerk, herhaalmedicatie, en direct patientcontact in een middelgrote stad.',
   'https://example.com/coschappen/jansen-amersfoort',
   '#f46e32',
   (select id from public.specializations where code = 'openbare')),
  ('service-utrecht', 'Service Apotheek Utrecht Centrum',
   'Utrecht',
   'Drukke openbare apotheek met veel logistiek, medicatiebeoordelingen, en samenwerking met huisartsen.',
   'https://example.com/coschappen/service-utrecht',
   '#be185d',
   (select id from public.specializations where code = 'openbare')),
  ('stadsapotheek-rotterdam', 'Stadsapotheek Rotterdam West',
   'Rotterdam',
   'Brede openbare stageplek met gevarieerde patientpopulatie, baxterprocessen, en veel eerste-lijns vragen.',
   'https://example.com/coschappen/stadsapotheek-rotterdam',
   '#0f766e',
   (select id from public.specializations where code = 'openbare')),
  ('rode-kruis-ziekenhuis', 'Rode Kruis Ziekenhuis',
   'Beverwijk',
   'Ziekenhuisapotheek met nadruk op klinische afstemming, medicatieverificatie, en multidisciplinair samenwerken.',
   'https://example.com/coschappen/rode-kruis-ziekenhuis',
   '#001158',
   (select id from public.specializations where code = 'ziekenhuis-poli')),
  ('erasmus-poliklinisch', 'Erasmus MC Poliklinische Apotheek',
   'Rotterdam',
   'Poliklinische apotheek met hoog tempo, ontslagmedicatie, en veel patientuitleg in een academische setting.',
   'https://example.com/coschappen/erasmus-poliklinisch',
   '#0c2577',
   (select id from public.specializations where code = 'ziekenhuis-poli')),
  ('umcg-ziekenhuisapotheek', 'UMCG Ziekenhuisapotheek',
   'Groningen',
   'Academische ziekenhuisapotheek met exposure aan bereidingen, klinische farmacie, en specialistische zorgpaden.',
   'https://example.com/coschappen/umcg-ziekenhuisapotheek',
   '#2563eb',
   (select id from public.specializations where code = 'ziekenhuis-poli'))
on conflict (slug) do update
set title          = excluded.title,
    location       = excluded.location,
    description    = excluded.description,
    studiegids_url = excluded.studiegids_url,
    color          = excluded.color,
    type_id        = excluded.type_id;

insert into public.admins (email) values
  ('s.r.de.groot.2@umail.leidenuniv.nl')
on conflict (email) do nothing;
