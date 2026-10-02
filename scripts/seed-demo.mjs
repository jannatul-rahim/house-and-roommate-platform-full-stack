#!/usr/bin/env node
/**
 * Seeds realistic demo data through the real API so every role has something
 * to explore. Safe to re-run: accounts are reused and listings are only
 * created when the demo owner has none.
 *
 *   node --env-file=.env.local scripts/seed-demo.mjs
 */

const API = (process.env.API_BASE_URL ?? "http://localhost:5050/api/v1").replace(/\/$/, "");

const accounts = {
  admin: { email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD },
  owner: {
    name: "Rafiq Ahmed",
    email: process.env.DEMO_OWNER_EMAIL ?? "owner.demo@nestmate.app",
    password: process.env.DEMO_OWNER_PASSWORD ?? "OwnerDemo@2026",
    phone: "+8801711000111",
    role: "OWNER",
  },
  tenant: {
    name: "Tasnim Rahman",
    email: process.env.DEMO_TENANT_EMAIL ?? "tenant.demo@nestmate.app",
    password: process.env.DEMO_TENANT_PASSWORD ?? "TenantDemo@2026",
    phone: "+8801811000222",
    role: "TENANT",
  },
  tenant2: {
    name: "Nadia Islam",
    email: "nadia.demo@nestmate.app",
    password: "NadiaDemo@2026",
    phone: "+8801911000333",
    role: "TENANT",
  },
  tenant3: {
    name: "Arif Hossain",
    email: "arif.demo@nestmate.app",
    password: "ArifDemo@2026",
    phone: "+8801611000444",
    role: "TENANT",
  },
};

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays, hour = 0) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

async function call(method, path, { token, body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const detail = json?.errors?.length ? ` (${json.errors.map((e) => `${e.path}: ${e.message}`).join("; ")})` : "";
    const error = new Error(`${method} ${path} -> ${res.status} ${json?.message ?? ""}${detail}`);
    error.status = res.status;
    throw error;
  }
  return json;
}

async function signIn(account) {
  try {
    const { data } = await call("POST", "/auth/login", { body: { email: account.email, password: account.password } });
    return data.accessToken;
  } catch (error) {
    if (error.status !== 401 || !account.role) throw error;
    const { name, email, password, phone, role } = account;
    const { data } = await call("POST", "/auth/register", { body: { name, email, password, phone, role } });
    console.log(`  registered ${email}`);
    return data.accessToken;
  }
}

const LISTINGS = [
  {
    property: {
      title: "Lakeview Shared Apartment, Gulshan 2",
      description:
        "Bright 3-bedroom apartment overlooking Gulshan Lake. Fully furnished living room, 24/7 security, lift, generator back-up and fibre internet. Five minutes' walk to Gulshan 2 circle.",
      propertyType: "APARTMENT",
      address: "Road 71, House 12, Gulshan 2",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      zipCode: "1212",
      status: "PUBLISHED",
    },
    building: { name: "Lakeview Tower", description: "12-storey residential tower with rooftop garden." },
    unit: { unitNumber: "7A", floor: 7, bedrooms: 3, bathrooms: 2 },
    rooms: [
      { roomNumber: "A1", name: "Master bedroom with balcony", roomType: "MASTER", monthlyRent: "22000", securityDeposit: "22000" },
      { roomNumber: "A2", name: "Lake-facing private room", roomType: "PRIVATE", monthlyRent: "16000", securityDeposit: "16000" },
      { roomNumber: "A3", name: "Shared twin room", roomType: "SHARED", monthlyRent: "9500", securityDeposit: "9500" },
    ],
  },
  {
    property: {
      title: "Dhanmondi Garden House",
      description:
        "Quiet two-storey family house on a tree-lined lane near Dhanmondi Lake. Shared kitchen, private garden and parking. Ideal for professionals and postgraduate students.",
      propertyType: "HOUSE",
      address: "Road 9/A, House 44, Dhanmondi",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      zipCode: "1209",
      status: "PUBLISHED",
    },
    building: { name: "Main House" },
    unit: { unitNumber: "First floor", floor: 1, bedrooms: 2, bathrooms: 2 },
    rooms: [
      { roomNumber: "D1", name: "Garden view room", roomType: "PRIVATE", monthlyRent: "14000", securityDeposit: "14000" },
      { roomNumber: "D2", name: "Corner room with study desk", roomType: "PRIVATE", monthlyRent: "13000", securityDeposit: "13000" },
    ],
  },
  {
    property: {
      title: "Banani Studio Residences",
      description:
        "Modern serviced studios in Banani with kitchenette, en-suite bathroom, weekly housekeeping and a co-working lounge on the ground floor.",
      propertyType: "CONDO",
      address: "Road 11, Block E, Banani",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      zipCode: "1213",
      status: "PUBLISHED",
    },
    building: { name: "Banani Residences" },
    unit: { unitNumber: "4B", floor: 4, bedrooms: 2, bathrooms: 2 },
    rooms: [
      { roomNumber: "S401", name: "Studio 401", roomType: "STUDIO", monthlyRent: "26000", securityDeposit: "30000" },
      { roomNumber: "S402", name: "Studio 402", roomType: "STUDIO", monthlyRent: "24500", securityDeposit: "30000" },
    ],
  },
  {
    property: {
      title: "Agrabad Green Villa",
      description:
        "Spacious villa in Agrabad with a landscaped courtyard, rooftop terrace and covered parking. Close to the commercial district and Chattogram port offices.",
      propertyType: "VILLA",
      address: "Lane 3, Agrabad C/A",
      city: "Chattogram",
      state: "Chattogram Division",
      country: "Bangladesh",
      zipCode: "4100",
      status: "PUBLISHED",
    },
    building: { name: "Green Villa" },
    unit: { unitNumber: "Upper", floor: 2, bedrooms: 4, bathrooms: 3 },
    rooms: [
      { roomNumber: "V1", name: "Terrace suite", roomType: "MASTER", monthlyRent: "20000", securityDeposit: "20000" },
      { roomNumber: "V2", name: "Courtyard room", roomType: "PRIVATE", monthlyRent: "12500", securityDeposit: "12500" },
    ],
  },
  {
    property: {
      title: "Uttara Student Living",
      description:
        "Affordable shared rooms for students in Uttara Sector 7, a short ride from major universities. Study room, laundry, meals on request and CCTV-secured entrance.",
      propertyType: "BUILDING",
      address: "Road 18, Sector 7, Uttara",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      zipCode: "1230",
      status: "PUBLISHED",
    },
    building: { name: "Block C" },
    unit: { unitNumber: "3C", floor: 3, bedrooms: 4, bathrooms: 2 },
    rooms: [
      { roomNumber: "C1", name: "Twin share — window side", roomType: "SHARED", monthlyRent: "6500", securityDeposit: "6500" },
      { roomNumber: "C2", name: "Twin share — balcony", roomType: "SHARED", monthlyRent: "7000", securityDeposit: "7000" },
      { roomNumber: "C3", name: "Single study room", roomType: "PRIVATE", monthlyRent: "9000", securityDeposit: "9000" },
    ],
  },
  {
    property: {
      title: "Zindabazar Riverside Flat",
      description:
        "Comfortable flat near the Surma river with tea-garden views from the balcony. Walking distance to Zindabazar shopping and Sylhet city centre.",
      propertyType: "APARTMENT",
      address: "Chowhatta Road, Zindabazar",
      city: "Sylhet",
      state: "Sylhet Division",
      country: "Bangladesh",
      zipCode: "3100",
      status: "PUBLISHED",
    },
    building: { name: "Riverside Court" },
    unit: { unitNumber: "5D", floor: 5, bedrooms: 2, bathrooms: 1 },
    rooms: [{ roomNumber: "R1", name: "Balcony room", roomType: "PRIVATE", monthlyRent: "11000", securityDeposit: "11000" }],
  },
  {
    property: {
      title: "Mirpur DOHS Duplex (coming soon)",
      description: "Newly renovated duplex being prepared for listing — rooms open next month.",
      propertyType: "HOUSE",
      address: "Avenue 4, Mirpur DOHS",
      city: "Dhaka",
      state: "Dhaka Division",
      country: "Bangladesh",
      zipCode: "1216",
      status: "DRAFT",
    },
  },
];

const PREFERENCES = [
  { name: "Early riser", type: "Lifestyle" },
  { name: "Night owl", type: "Lifestyle" },
  { name: "Works from home", type: "Lifestyle" },
  { name: "Quiet hours after 11pm", type: "Household" },
  { name: "Tidy shared spaces", type: "Household" },
  { name: "Cooks at home", type: "Household" },
  { name: "Vegetarian", type: "Diet" },
  { name: "Halal kitchen", type: "Diet" },
  { name: "Gym regular", type: "Interests" },
  { name: "Music & guitar", type: "Interests" },
];

async function main() {
  console.log(`Seeding demo data against ${API}`);
  if (!accounts.admin.email || !accounts.admin.password) throw new Error("DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD are required");

  const admin = await signIn(accounts.admin);
  const owner = await signIn(accounts.owner);
  const tenant = await signIn(accounts.tenant);
  const tenant2 = await signIn(accounts.tenant2);
  const tenant3 = await signIn(accounts.tenant3);
  console.log("✓ accounts ready");

  // --- Roommate preference catalogue (admin) ---
  const existingPrefs = (await call("GET", "/preferences", { token: admin })).data;
  for (const pref of PREFERENCES) {
    if (!existingPrefs.some((p) => p.name === pref.name)) {
      await call("POST", "/preferences", { token: admin, body: pref });
    }
  }
  const prefs = (await call("GET", "/preferences", { token: admin })).data;
  const prefId = (name) => prefs.find((p) => p.name === name)?.id;
  console.log(`✓ ${prefs.length} roommate preferences`);

  // --- Listings (owner) ---
  const mine = await call("GET", "/properties/my-properties?limit=50", { token: owner });
  const roomsByTitle = {};
  if (mine.meta.total === 0) {
    for (const listing of LISTINGS) {
      const { data: property } = await call("POST", "/properties", { token: owner, body: listing.property });
      roomsByTitle[property.title] = { property, rooms: [] };
      if (!listing.building) continue;
      const { data: building } = await call("POST", `/properties/${property.id}/buildings`, { token: owner, body: listing.building });
      const { data: unit } = await call("POST", `/buildings/${building.id}/units`, { token: owner, body: listing.unit });
      for (const room of listing.rooms) {
        const { data: created } = await call("POST", `/units/${unit.id}/rooms`, { token: owner, body: room });
        await call("POST", `/rooms/${created.id}/availability`, {
          token: owner,
          body: { availableFrom: iso(-2), availableTo: iso(365) },
        });
        roomsByTitle[property.title].rooms.push({ ...created, unitId: unit.id });
      }
      console.log(`  + ${property.title}`);
    }
    console.log("✓ listings created");
  } else {
    console.log(`• owner already has ${mine.meta.total} properties — skipping listings & rental flow`);
    return finishRoommates({ tenant, tenant2, tenant3, prefId });
  }

  // --- Rental workflow ---
  const lakeview = roomsByTitle["Lakeview Shared Apartment, Gulshan 2"];
  const leasedRoom = lakeview.rooms[1];

  // 1. Tasnim views and rents the lake-facing room.
  const { data: viewing } = await call("POST", "/viewing-requests", {
    token: tenant,
    body: { roomId: leasedRoom.id, requestedDate: iso(2, 11), requestedTime: "17:00", message: "Hi! I work in Gulshan and would love to see the room after office hours." },
  });
  await call("PATCH", `/viewing-requests/${viewing.id}/approve`, { token: owner, body: {} });
  const { data: application } = await call("POST", "/applications", {
    token: tenant,
    body: { roomId: leasedRoom.id, viewingRequestId: viewing.id, message: "Software engineer at a Gulshan fintech, non-smoker, planning to stay at least a year." },
  });
  await call("PATCH", `/applications/${application.id}/approve`, { token: owner, body: {} });
  const { data: lease } = await call("POST", "/leases", {
    token: owner,
    body: { applicationId: application.id, startDate: iso(0), endDate: iso(365) },
  });
  console.log("✓ viewing → application → active lease");

  // 2. Pending items so the owner has a request inbox.
  const banani = roomsByTitle["Banani Studio Residences"];
  await call("POST", "/viewing-requests", {
    token: tenant,
    body: { roomId: banani.rooms[0].id, requestedDate: iso(4, 10), requestedTime: "11:30", message: "Is the studio available for a 6-month stay?" },
  });
  const uttara = roomsByTitle["Uttara Student Living"];
  await call("POST", "/viewing-requests", {
    token: tenant2,
    body: { roomId: uttara.rooms[2].id, requestedDate: iso(3, 9), requestedTime: "10:00", message: "Final-year student at NSU — can I visit on Saturday?" },
  });
  await call("POST", "/applications", {
    token: tenant2,
    body: { roomId: uttara.rooms[2].id, message: "Quiet student, happy to pay three months in advance." },
  });
  const dhanmondi = roomsByTitle["Dhanmondi Garden House"];
  const { data: rejected } = await call("POST", "/applications", {
    token: tenant3,
    body: { roomId: dhanmondi.rooms[0].id, message: "Looking for a room for my research fellowship." },
  });
  await call("PATCH", `/applications/${rejected.id}/reject`, { token: owner, body: {} });
  await call("POST", "/applications", {
    token: tenant3,
    body: { roomId: dhanmondi.rooms[1].id, message: "Would the corner room work for a 12-month lease?" },
  });
  console.log("✓ pending viewing requests & applications");

  // 3. Maintenance + utility bill on the active lease.
  const { data: ticket } = await call("POST", "/maintenance-requests", {
    token: tenant,
    body: { roomId: leasedRoom.id, title: "Air conditioner leaking water", description: "The split AC drips onto the floor after about an hour of use. Probably a blocked drain pipe.", priority: "HIGH" },
  });
  await call("POST", `/maintenance-requests/${ticket.id}/start`, { token: owner });
  await call("POST", "/maintenance-requests", {
    token: tenant,
    body: { roomId: leasedRoom.id, title: "Bathroom light flickering", description: "The ceiling light in the attached bathroom flickers and sometimes turns off.", priority: "LOW" },
  });
  const { data: bill } = await call("POST", "/utility-bills", {
    token: owner,
    body: {
      propertyId: lakeview.property.id,
      unitId: leasedRoom.unitId,
      type: "ELECTRICITY",
      totalAmount: "4800",
      billingPeriodStart: iso(-30),
      billingPeriodEnd: iso(-1),
      dueDate: iso(10),
    },
  });
  await call("POST", `/utility-bills/${bill.id}/splits`, { token: owner, body: { tenantId: lease.tenantId, amount: "1600" } });
  await call("POST", "/utility-bills", {
    token: owner,
    body: { propertyId: lakeview.property.id, unitId: leasedRoom.unitId, type: "INTERNET", totalAmount: "1500", billingPeriodStart: iso(-30), billingPeriodEnd: iso(-1), dueDate: iso(5) },
  });
  console.log("✓ maintenance tickets & utility bills");

  await finishRoommates({ tenant, tenant2, tenant3, prefId });
}

async function finishRoommates({ tenant, tenant2, tenant3, prefId }) {
  const profiles = [
    {
      token: tenant,
      profile: { bio: "Software engineer who loves weekend cooking and board games. Clean, friendly and respectful of quiet hours.", occupation: "Software Engineer", budgetMin: "12000", budgetMax: "18000", preferredLocation: "Gulshan, Dhaka", moveInDate: iso(20), smoking: false, pets: false, genderPreference: "Female", isDiscoverable: true },
      prefs: ["Early riser", "Tidy shared spaces", "Cooks at home"],
    },
    {
      token: tenant2,
      profile: { bio: "Final-year BBA student. Usually at the library during the day, enjoys yoga and trying new cafés.", occupation: "Student", budgetMin: "8000", budgetMax: "15000", preferredLocation: "Gulshan, Dhaka", moveInDate: iso(25), smoking: false, pets: false, genderPreference: "Female", isDiscoverable: true },
      prefs: ["Early riser", "Tidy shared spaces", "Vegetarian"],
    },
    {
      token: tenant3,
      profile: { bio: "Research fellow working on climate data. Plays guitar (with headphones!) and goes to the gym most evenings.", occupation: "Research Fellow", budgetMin: "10000", budgetMax: "16000", preferredLocation: "Dhanmondi, Dhaka", moveInDate: iso(40), smoking: false, pets: true, genderPreference: "Any", isDiscoverable: true },
      prefs: ["Night owl", "Gym regular", "Music & guitar"],
    },
  ];
  for (const { token, profile, prefs } of profiles) {
    try {
      await call("POST", "/roommate-profile", { token, body: profile });
    } catch (error) {
      if (error.status !== 409) throw error;
    }
    await call("PUT", "/roommate-preferences/me", {
      token,
      body: { preferences: prefs.map((name) => ({ preferenceId: prefId(name) })).filter((p) => p.preferenceId) },
    });
  }
  console.log("✓ roommate profiles & preferences");
  console.log("Done.");
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
