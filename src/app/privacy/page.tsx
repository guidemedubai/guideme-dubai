import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Doletz",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 prose prose-neutral dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: May 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly: name, email, phone number,
        and booking details. We also collect usage data such as pages visited and
        device information.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Process and manage your bookings</li>
        <li>Communicate booking confirmations and updates</li>
        <li>Improve our platform and services</li>
        <li>Provide customer support</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>
        We share your information with property owners and service providers only
        as necessary to fulfill your bookings. We do not sell your personal data
        to third parties.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We implement appropriate security measures to protect your personal information.
        However, no method of transmission over the internet is 100% secure.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data
        by contacting us at hello@doletz.com.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use cookies to enhance your experience. See our Cookie Policy for details.
      </p>

      <h2>7. Contact</h2>
      <p>
        For privacy-related inquiries, contact us at hello@doletz.com.
      </p>
    </div>
  );
}
