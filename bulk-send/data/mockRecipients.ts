export interface Recipient {
  id: string;
  name: string;
  email: string;
  tags: string[];
  customField?: string;
}

export const mockRecipients: Recipient[] = [
  { id: "r1", name: "Alice Johnson", email: "alice@acme.com", tags: ["vip", "newsletter"], customField: "Enterprise" },
  { id: "r2", name: "Bob Martinez", email: "bob@startup.io", tags: ["newsletter"], customField: "Startup" },
  { id: "r3", name: "Carol Lee", email: "carol@design.co", tags: ["vip"], customField: "Agency" },
  { id: "r4", name: "David Kim", email: "david@techcorp.com", tags: ["newsletter", "trial"], customField: "SMB" },
  { id: "r5", name: "Eva Schmidt", email: "eva@berlin.de", tags: ["vip", "trial"], customField: "Enterprise" },
  { id: "r6", name: "Frank Nguyen", email: "frank@saas.io", tags: ["newsletter"], customField: "Startup" },
  { id: "r7", name: "Grace Patel", email: "grace@creative.in", tags: ["vip"], customField: "Freelancer" },
  { id: "r8", name: "Hiro Tanaka", email: "hiro@jpmail.jp", tags: ["trial"], customField: "SMB" },
];
