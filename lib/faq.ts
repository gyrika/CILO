import { SITE_NAME } from "@/lib/site-info";

// Homepage FAQ. Rendered visibly and as FAQPage JSON-LD from this one list,
// so the structured data always matches what's on the page (a requirement
// for FAQ markup). General information only -- keep the answers hedged and
// have them checked before changing any figures.
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "How much deposit do I need to rent an apartment in Colombo?",
    answer:
      "Most landlords ask for a refundable security deposit, commonly two to three months' rent, plus rent paid in advance. For apartments in Colombo, paying several months to a year in advance is common, though this varies by landlord and is often negotiable. Make sure the deposit, the advance and the refund terms are written into the lease agreement.",
  },
  {
    question:
      "What documents should I check before buying property in Sri Lanka?",
    answer:
      "Have a lawyer (notary) check the title deed and the chain of earlier deeds, usually going back around 30 years; Land Registry extracts confirming ownership and any mortgages or other encumbrances; the survey plan; and local authority documents such as the street line and non-vesting certificates and, for a building, the approved plan and Certificate of Conformity. For an apartment, also check the condominium plan.",
  },
  {
    question: "Can foreigners buy property in Sri Lanka?",
    answer:
      "Foreigners generally cannot buy freehold land in Sri Lanka, but they can buy condominium apartments, typically on the fourth floor or above, and can lease land long-term. The rules have changed over the years, so confirm the current position with a lawyer before committing to a purchase.",
  },
  {
    question: "What costs are there on top of the purchase price?",
    answer:
      "Buyers usually pay stamp duty on the deed (in the Western Province, 3% on the first LKR 100,000 and 4% on the remainder), the notary's fees for preparing and attesting the deed, and the Land Registry fee to register it. Ask your lawyer for a full estimate before you sign.",
  },
  {
    question: `How does ${SITE_NAME} work?`,
    answer: `Browse listings on ${SITE_NAME}, filtering by sale or rent, property type, city and price. When you find a property you're interested in, send an inquiry from its page with your name and contact details, and the ${SITE_NAME} team will get back to you about it.`,
  },
];
