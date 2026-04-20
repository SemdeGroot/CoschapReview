-- Seed the two placement categories used by CoschapReview.

insert into public.specializations (code, name, study_id) values
  ('ziekenhuis-poli', 'Ziekenhuisapotheek / Poliklinische apotheek', 'hospital'),
  ('openbare', 'Openbare apotheek', 'public')
on conflict (code) do update
set name     = excluded.name,
    study_id = excluded.study_id;
