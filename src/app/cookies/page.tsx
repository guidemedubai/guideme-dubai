import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Doletz",
};

export default function CookiesPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 prose prose-neutral dark:prose-invert">
      <h1>Cookie Policy</h1>
      <p className="text-muted-foreground">Last updated: May 2026</p>

      <h2>What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit our website.
        They help us provide a better experience by remembering your preferences
        and login status.
      </p>

      <h2>Cookies We Use</h2>
      <ul>
        <li><strong>Essential cookies:</strong> Required for authentication and basic site functionality.</li>
        <li><strong>Preference cookies:</strong> Remember your settings like theme and language.</li>
        <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site.</li>
      </ul>

      <h2>Managing Cookies</h2>
      <p>
        You can control cookies through your browser settings. Disabling essential
        cookies may affect site functionality.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about our cookie usage? Contact us at hello@doletz.com.
      </p>
    </div>
  );
}
