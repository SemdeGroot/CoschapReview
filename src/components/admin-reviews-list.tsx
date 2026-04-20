"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, MessageSquare, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Rating } from "@/components/rating";
import { deleteReviewAction } from "@/server-actions/admin";

const DATE_FMT = new Intl.DateTimeFormat("nl-NL", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export type AdminReviewRow = {
  id: string;
  title: string;
  body: string;
  rating: number;
  created_at: string;
  author_id: string;
  course_id: string;
  authorEmail: string;
  courseSlug: string | null;
  courseTitle: string | null;
};

type Props = {
  reviews: AdminReviewRow[];
};

export function AdminReviewsList({ reviews }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? reviews.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.authorEmail.toLowerCase().includes(q) ||
          (r.courseTitle ?? "").toLowerCase().includes(q)
        );
      })
    : reviews;

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <MessageSquare size={24} className="mx-auto text-muted-foreground" />
        <h2 className="mt-2 text-base font-semibold text-foreground">
          Nog geen reviews
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nieuwe reviews verschijnen hier zodra studenten ze plaatsen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Zoek op titel, inhoud, auteur of apotheek..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Geen reviews gevonden voor &ldquo;{query}&rdquo;.
        </div>
      ) : (
        filtered.map((r) => {
          const deleteReview = deleteReviewAction.bind(null, r.id);
          return (
            <article
              key={r.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {r.title}
                    </h3>
                    {r.courseSlug && (
                      <Link
                        href={`/coschappen/${r.courseSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground hover:bg-secondary"
                      >
                        {r.courseTitle ?? r.courseSlug}
                        <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{r.authorEmail}</span>
                    {" · "}
                    {DATE_FMT.format(new Date(r.created_at))}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Rating value={r.rating} size="md" />
                  <ConfirmDeleteButton
                    title="Deze review verwijderen?"
                    description="De review wordt definitief verwijderd. De reviewer kan daarna opnieuw een review plaatsen."
                    action={deleteReview}
                    successMessage="Review verwijderd."
                  />
                </div>
              </header>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {r.body}
              </p>
              <dl className="mt-4 flex gap-5 border-t border-border pt-3 text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Score
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {r.rating.toFixed(1)} / 5
                  </dd>
                </div>
              </dl>
            </article>
          );
        })
      )}
    </div>
  );
}
