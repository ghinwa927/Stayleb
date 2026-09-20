import {
  Zap,
  ShieldCheck,
  Banknote,
  Headset,
  BadgeCheck,
  Star,
} from "lucide-react";
const assurances = [
  {
    icon: Zap,
    title: "24/7 Power Assurance",
    description:
      "Dual UPS backup + on-site Perkins heavy generators ensure seamless electricity and AC day and night.",
  },
  {
    icon: ShieldCheck,
    title: "Decree 4123 Inspected",
    description:
      "Rigorous safety audits, clean independent cistern water reserves, and sanitized pool compliance.",
  },
  {
    icon: Banknote,
    title: "Flexible Fresh USD",
    description:
      "International credit cards securely escrowed online or verified Cash-on-Arrival key handovers.",
  },
  {
    icon: Headset,
    title: "Local Village Caretakers",
    description:
      "Trusted on-ground natours within 15 mins for warm arrival check-ins, fireplace wood, and immediate support.",
  },
];
export function Assurances() {
  return (
    <section
      className="page-container assurances"
      aria-label="StayLeb assurances"
    >
      {assurances.map(({ icon: Icon, title, description }) => (
        <article key={title}>
          <span>
            <Icon size={25} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
export function Guarantee() {
  return (
    <section id="guarantee" className="page-container guarantee-section">
      <div className="guarantee">
        <div className="guarantee-copy">
          <h2>
            <BadgeCheck size={24} />
            The StayLeb Hospitality Guarantee
          </h2>
          <h3>
            “Zero blackouts, crystal water, and genuine Lebanese welcoming.”
          </h3>
          <p>
            Every listing undergoes our on-site 28-point Lebanese infrastructure
            checklist before appearing on StayLeb. Our network of verified
            village caretakers (natours) handles keys personally, fills the
            firewood, and remains on standby 24/7.
          </p>
          <div className="guarantee-stats">
            {[
              ["99.8%", "Power Uptime Recorded"],
              ["15 Mins", "Average Caretaker Response"],
              ["4,800+", "Stays Hosted Safely"],
            ].map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
        <blockquote>
          <div className="review-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Star size={17} key={i} />
            ))}
            <span>Verified Stay • Batroun Coast</span>
          </div>
          <p>
            “Visiting from Dubai with my family, we were worried about power
            cuts and water. StayLeb&apos;s chalet in Batroun had flawless AC all
            weekend, blazing WiFi for my remote work, and Abou Tony greeted us
            with freshly picked figs and chilled lemonade.”
          </p>
          <footer>
            <span>TG</span>
            <div>
              <strong>Tarek &amp; Gabriella G.</strong>
              <small>Booked Azure Batroun Cliff Villa</small>
            </div>
          </footer>
        </blockquote>
      </div>
      <p className="sample-note">
        * Sample listing data, caretaker contacts, and imagery compiled for
        prototype demonstration. All pricing displayed in Fresh USD.
      </p>
    </section>
  );
}
