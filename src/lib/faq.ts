export const faqGroups = [
  {
    title: "Renting a room",
    items: [
      { q: "Do I need an account to browse rooms?", a: "No. Anyone can search published listings and see rent, deposit and availability. You need a tenant account to request a viewing or apply." },
      { q: "How do viewing requests work?", a: "Pick a date inside the room's availability window and an optional time. The owner approves or rejects it, and you can cancel a pending request at any time from your dashboard." },
      { q: "Can I apply without a viewing?", a: "Yes. Attaching an approved viewing is optional but usually helps owners decide faster." },
      { q: "When is my lease created?", a: "After the owner approves your application, they create the lease with a start date (and optional end date). Rent and deposit are copied from the room so there are no surprises." },
    ],
  },
  {
    title: "Payments",
    items: [
      { q: "How do I pay rent?", a: "Open My leases and click Pay. You're redirected to Stripe Checkout; after paying you return to a receipt page and the payment appears in your history." },
      { q: "Is my card information safe?", a: "Card details are entered on Stripe's hosted page — NestMate never sees or stores your card number." },
      { q: "What happens if I cancel checkout?", a: "Nothing is charged. You land on a cancellation page and can retry whenever you're ready." },
      { q: "Which currency is used?", a: "All rent and utility bills are in Bangladeshi Taka (BDT)." },
    ],
  },
  {
    title: "Roommates",
    items: [
      { q: "How is the compatibility score calculated?", a: "We compare budget overlap (30 pts), lifestyle — smoking and pets (20), preferred location (20), move-in timing (15) and shared preferences (15). The score only counts factors you both filled in." },
      { q: "Can I hide my roommate profile?", a: "Yes. Turn off \"Show my profile in roommate search\" in the profile wizard; you can still browse others." },
    ],
  },
  {
    title: "Property owners",
    items: [
      { q: "How do I list a property?", a: "Create an owner account and use the Add property wizard. It sets up the property, building, unit, first room and availability in one flow. Add more rooms from the manage page." },
      { q: "Can I pause a listing?", a: "Yes — unpublish it from My properties or the availability switches on your profile page. It disappears from search but keeps its history." },
      { q: "How do utility bills work?", a: "Record a bill for a property, then split it between tenants with an active lease. Each tenant sees their share in their dashboard." },
    ],
  },
];
