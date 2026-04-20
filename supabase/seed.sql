-- Seed data for CoschapReview.
-- Runs automatically on `npx supabase db reset`.
--
-- IMPORTANT: change the admin email on the final INSERT to your own
-- address before testing.

insert into public.courses (slug, title, location, description, studiegids_url, color, icon, ec) values
  ('jansen-amersfoort', 'Apotheek Jansen Amersfoort',
   'Amersfoort',
   'Openbare apotheek met veel baliewerk, herhaalmedicatie, en direct patientcontact in een middelgrote stad.',
   'https://example.com/coschappen/jansen-amersfoort',
   '#f46e32', 'public', 18),
  ('service-utrecht', 'Service Apotheek Utrecht Centrum',
   'Utrecht',
   'Drukke openbare apotheek met veel logistiek, medicatiebeoordelingen, en samenwerking met huisartsen.',
   'https://example.com/coschappen/service-utrecht',
   '#be185d', 'public', 18),
  ('stadsapotheek-rotterdam', 'Stadsapotheek Rotterdam West',
   'Rotterdam',
   'Brede openbare stageplek met gevarieerde patientpopulatie, baxterprocessen, en veel eerste-lijns vragen.',
   'https://example.com/coschappen/stadsapotheek-rotterdam',
   '#0f766e', 'public', 18),
  ('rode-kruis-ziekenhuis', 'Rode Kruis Ziekenhuis',
   'Beverwijk',
   'Ziekenhuisapotheek met nadruk op klinische afstemming, medicatieverificatie, en multidisciplinair samenwerken.',
   'https://example.com/coschappen/rode-kruis-ziekenhuis',
   '#001158', 'hospital', 18),
  ('erasmus-poliklinisch', 'Erasmus MC Poliklinische Apotheek',
   'Rotterdam',
   'Poliklinische apotheek met hoog tempo, ontslagmedicatie, en veel patientuitleg in een academische setting.',
   'https://example.com/coschappen/erasmus-poliklinisch',
   '#0c2577', 'hospital', 18),
  ('umcg-ziekenhuisapotheek', 'UMCG Ziekenhuisapotheek',
   'Groningen',
   'Academische ziekenhuisapotheek met exposure aan bereidingen, klinische farmacie, en specialistische zorgpaden.',
   'https://example.com/coschappen/umcg-ziekenhuisapotheek',
   '#2563eb', 'hospital', 18)
on conflict (slug) do update
set title          = excluded.title,
    location       = excluded.location,
    description    = excluded.description,
    studiegids_url = excluded.studiegids_url,
    color          = excluded.color,
    icon           = excluded.icon,
    ec             = excluded.ec;

with mapping (course_slug, spec_code, role) as (values
  ('jansen-amersfoort', 'openbare', 'core'),
  ('service-utrecht', 'openbare', 'core'),
  ('stadsapotheek-rotterdam', 'openbare', 'core'),
  ('rode-kruis-ziekenhuis', 'ziekenhuis-poli', 'core'),
  ('erasmus-poliklinisch', 'ziekenhuis-poli', 'core'),
  ('umcg-ziekenhuisapotheek', 'ziekenhuis-poli', 'core')
)
insert into public.course_specializations (course_id, specialization_id, role)
select c.id, s.id, m.role
from mapping m
join public.courses c on c.slug = m.course_slug
join public.specializations s on s.code = m.spec_code
on conflict (course_id, specialization_id) do update
set role = excluded.role;

insert into public.admins (email) values
  ('s.r.de.groot.2@umail.leidenuniv.nl')
on conflict (email) do nothing;
