create extension if not exists pg_trgm;

create or replace function public.normalize_course_identity(value text)
returns text
language sql
immutable
as $$
  select trim(
    regexp_replace(
      lower(
        translate(
          coalesce(value, ''),
          'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøŠšÙÚÛÜùúûüÝýÿŽž',
          'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOOooooooSsUUUUuuuuYyyZz'
        )
      ),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

drop index if exists courses_title_location_normalized_idx;
create unique index courses_title_location_normalized_idx
  on public.courses (
    public.normalize_course_identity(title),
    public.normalize_course_identity(location)
  );

create or replace function public.find_course_duplicate_candidates(
  input_title text,
  input_location text,
  match_limit integer default 5
)
returns table (
  id uuid,
  slug text,
  title text,
  location text,
  title_similarity real,
  location_similarity real,
  combined_similarity real,
  exact_duplicate boolean
)
language sql
stable
set search_path = public
as $$
  with normalized_input as (
    select
      public.normalize_course_identity(input_title) as title,
      public.normalize_course_identity(input_location) as location
  ),
  ranked as (
    select
      c.id,
      c.slug,
      c.title,
      c.location,
      similarity(public.normalize_course_identity(c.title), ni.title)::real as title_similarity,
      similarity(public.normalize_course_identity(c.location), ni.location)::real as location_similarity,
      (
        similarity(public.normalize_course_identity(c.title), ni.title) * 0.7 +
        similarity(public.normalize_course_identity(c.location), ni.location) * 0.3
      )::real as combined_similarity,
      (
        public.normalize_course_identity(c.title) = ni.title and
        public.normalize_course_identity(c.location) = ni.location
      ) as exact_duplicate
    from public.courses c
    cross join normalized_input ni
    where (
      public.normalize_course_identity(c.title) = ni.title and
      public.normalize_course_identity(c.location) = ni.location
    )
    or (
      similarity(public.normalize_course_identity(c.title), ni.title) >= 0.36 and
      similarity(public.normalize_course_identity(c.location), ni.location) >= 0.3
    )
    or (
      public.normalize_course_identity(c.title) % ni.title and
      public.normalize_course_identity(c.location) % ni.location
    )
  )
  select *
  from ranked
  order by exact_duplicate desc, combined_similarity desc, title asc
  limit greatest(coalesce(match_limit, 5), 1);
$$;

grant execute on function public.find_course_duplicate_candidates(text, text, integer) to anon, authenticated;

drop policy if exists "courses insert by authenticated" on public.courses;
create policy "courses insert by authenticated"
  on public.courses for insert
  with check (auth.uid() is not null);
