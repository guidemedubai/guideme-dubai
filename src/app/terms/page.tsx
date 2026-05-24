import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Doletz",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 prose prose-neutral dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: May 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using Doletz, you agree to be bound by these Terms of Service.
        If you do not agree, please do not use our platform.
      </p>

      <h2>2. Services</h2>
      <p>
        Doletz provides an online platform for booking accommodations, activities,
        and travel services in the Maldives. We act as an intermediary between
        guests and property owners/service providers.
      </p>

      <h2>3. Bookings</h2>
      <p>
        All bookings are subject to availability and confirmation by the property owner.
        Prices are displayed in USD and include applicable taxes unless stated otherwise.
      </p>

      <h2>4. Cancellation Policy</h2>
      <p>
        Cancellation policies vary by property. Please review the specific cancellation
        terms before confirming your booking. Refunds are processed according to the
        property&apos;s cancellation policy.
      </p>

      <h2>5. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials
        and for all activities under your account.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        Doletz is not liable for any direct, indirect, or consequential damages arising
        from your use of the platform or services booked through it.
      </p>

      <h2>7. Contact</h2>
      <p>
        For questions about these terms, contact us at hello@doletz.com.
      </p>
    </div>
  );
}
