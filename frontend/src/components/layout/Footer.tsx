import { BadgeCheck, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LocalAction } from "@/components/ui/Feedback";
const groups = [
  {
    title: "Regional Discovery",
    items: [
      "Batroun Coastal Villas",
      "Faraya Ski Chalets",
      "Jbeil Historic Lodges",
      "Chouf Cedar Retreats",
      "Bcharreh Pine Cabins",
    ],
  },
  {
    title: "Guest Support",
    items: [
      "Booking Protection",
      "Caretaker Handover",
      "Cancellation Policies",
      "24/7 Power Assurance",
      "Concierge & Transfers",
    ],
  },
  {
    title: "Hosts & Legal",
    items: [
      "List Your Chalet",
      "Host Code of Ethics",
      "Terms of Service",
      "Privacy Policy",
      "Decree 4123 Compliance",
    ],
  },
];
export function Footer() {
  return (
    <footer className="public-footer" id="about">
      <div className="page-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo variant="wordmark" />
            <p>
              Handpicked private chalets, seaside stone residences, and alpine
              lodges across Mount Lebanon and the Mediterranean coastline.
              Guaranteed electricity and verified hosts.
            </p>
            <div className="footer-badges">
              <span>
                <BadgeCheck size={15} />
                Verified Properties
              </span>
              <span>
                <Zap size={15} />
                Generator Backed
              </span>
            </div>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    {group.title === "Regional Discovery" ? (
                      <a href="#destinations">{item}</a>
                    ) : (
                      <LocalAction
                        message={`${item} information is not available in this preview.`}
                      >
                        {item}
                      </LocalAction>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>
            © 2025 StayLeb Hospitality Technologies SAL. Regulated under
            Lebanese Ministry of Tourism Decree 4123 for Furnished Residences.
          </p>
          <span>Beirut, Lebanon　 •　 All Prices Displayed in Fresh USD</span>
        </div>
      </div>
    </footer>
  );
}
