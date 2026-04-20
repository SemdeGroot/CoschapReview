"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "success" | "error";

function encode(data: Record<string, string>) {
  return new URLSearchParams(data).toString();
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("new-apotheek");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode({ "form-name": "contact", name, email, subject, message }),
        });
        if (!res.ok) throw new Error();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    });
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-base font-semibold text-foreground">Bericht ontvangen</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We nemen je inzending zo snel mogelijk door. Bedankt voor je bijdrage.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <input type="hidden" name="form-name" value="contact" />
      <input type="hidden" name="bot-field" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Naam</Label>
          <Input
            id="contact-name"
            name="name"
            required
            placeholder="Jan de Vries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">E-mailadres</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="voorbeeld@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Onderwerp</Label>
        <select
          id="contact-subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={pending}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="new-apotheek">Apotheek toevoegen</option>
          <option value="correction">Aanpassing doorgeven</option>
          <option value="other">Overig</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Bericht</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Beschrijf je vraag of verbetering zo duidelijk mogelijk."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={pending}
          className="w-full min-h-[100px] sm:min-h-[120px] max-h-[360px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">
          Er is iets misgegaan. Probeer het opnieuw of stuur een e-mail naar info@semdegroot.com.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {pending ? "Versturen..." : "Versturen"}
      </Button>
    </form>
  );
}
