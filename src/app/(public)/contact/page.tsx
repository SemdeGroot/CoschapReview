import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact - Farmacoschap",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="animate-fade-up mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Staat een apotheek er niet bij, klopt er iets niet, of heb je een andere opmerking? Stuur het hieronder in.
        </p>
      </div>
      <div className="animate-fade-up-d1">
        <ContactForm />
      </div>
    </div>
  );
}
