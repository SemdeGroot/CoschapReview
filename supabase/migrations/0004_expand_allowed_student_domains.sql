create or replace function public.enforce_allowed_student_domain()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email is null or new.email !~* '@(umail\.leidenuniv\.nl|students\.uu\.nl|student\.rug\.nl)$' then
    raise exception 'Only approved university email addresses are allowed.'
      using errcode = '22000';
  end if;
  return new;
end;
$$;
