-- Simplify courses: replace course_specializations join table with a direct
-- type_id FK, and remove unused ec and icon columns.

-- 1. Add type_id to courses
alter table public.courses
  add column type_id smallint references public.specializations(id) on delete set null;

-- 2. Migrate data: pick the first (and typically only) specialization per course
update public.courses c
  set type_id = cs.specialization_id
  from (
    select distinct on (course_id) course_id, specialization_id
    from public.course_specializations
    order by course_id, specialization_id
  ) cs
  where c.id = cs.course_id;

-- 3. Drop RLS policies and the join table
drop policy if exists "course_specializations readable by all" on public.course_specializations;
drop policy if exists "course_specializations admin write" on public.course_specializations;
drop table if exists public.course_specializations;

-- 4. Drop the old view before removing columns it references, then remove columns
drop view if exists public.courses_with_stats;
alter table public.courses drop column if exists ec;
alter table public.courses drop column if exists icon;

-- 5. Rebuild courses_with_stats to include type info
create or replace view public.courses_with_stats as
select c.id,
       c.slug,
       c.title,
       c.location,
       c.description,
       c.studiegids_url,
       c.color,
       c.type_id,
       c.created_at,
       s.code                                             as type_code,
       s.name                                             as type_name,
       coalesce(avg(r.rating), 0)::numeric(3, 2)         as avg_rating,
       count(r.id)                                       as review_count
from public.courses c
left join public.specializations s on s.id = c.type_id
left join public.reviews r on r.course_id = c.id
group by c.id, s.code, s.name;

grant select on public.courses_with_stats to anon, authenticated;
alter view public.courses_with_stats set (security_invoker = off);
