import { destinations, posts, tours } from "../src/lib/sample-data";

const seed = {
  destinations,
  tours,
  bookings: [
    { status: "Pending", tourSlug: "hoi-an-private-heritage-walk" },
    { status: "Confirmed - Pay Later", tourSlug: "hue-imperial-small-group" },
    { status: "Completed", tourSlug: "free-hoi-an-lantern-walk" }
  ],
  posts,
  partners: [
    { name: "Central Vietnam Guides", partnerType: "tour-outsource" },
    { name: "Hoi An Wellness Spa", partnerType: "spa" }
  ]
};

console.log(JSON.stringify(seed, null, 2));
