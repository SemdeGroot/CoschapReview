drop policy if exists "courses update by authenticated" on public.courses;
create policy "courses update by authenticated"
  on public.courses for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "reviews update by author" on public.reviews;
create policy "reviews update by author"
  on public.reviews for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());
