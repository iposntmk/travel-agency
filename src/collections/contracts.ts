import type { AccessContext } from "@/types/domain";
import { adminOnly, isAuthenticated, publicRead, staffOnly } from "./access";

export type CollectionContract = {
  slug: string;
  access: {
    read: (context: AccessContext) => boolean;
    create: (context: AccessContext) => boolean;
    update: (context: AccessContext) => boolean;
    delete: (context: AccessContext) => boolean;
  };
};

const publicContent = (slug: string): CollectionContract => ({
  slug,
  access: {
    read: publicRead,
    create: staffOnly,
    update: staffOnly,
    delete: adminOnly
  }
});

export const collectionContracts: CollectionContract[] = [
  {
    slug: "users",
    access: { read: staffOnly, create: adminOnly, update: adminOnly, delete: adminOnly }
  },
  publicContent("media"),
  publicContent("product-categories"),
  publicContent("attractions"),
  publicContent("destinations"),
  publicContent("tours"),
  publicContent("car-rentals"),
  {
    slug: "customers",
    access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: adminOnly }
  },
  {
    slug: "bookings",
    access: {
      read: staffOnly,
      create: () => true,
      update: staffOnly,
      delete: adminOnly
    }
  },
  {
    slug: "custom-inquiries",
    access: {
      read: staffOnly,
      create: () => true,
      update: staffOnly,
      delete: adminOnly
    }
  },
  publicContent("posts"),
  publicContent("team-members"),
  {
    slug: "site-settings",
    access: { read: publicRead, create: staffOnly, update: staffOnly, delete: adminOnly }
  },
  publicContent("navigation"),
  {
    slug: "comments",
    access: {
      read: publicRead,
      create: isAuthenticated,
      update: staffOnly,
      delete: adminOnly
    }
  },
  publicContent("reviews"),
  {
    slug: "partners",
    access: { read: publicRead, create: staffOnly, update: staffOnly, delete: adminOnly }
  },
  {
    slug: "promotions",
    access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: adminOnly }
  },
  {
    slug: "payments",
    access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: adminOnly }
  }
];
