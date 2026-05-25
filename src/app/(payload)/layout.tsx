import config from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";
import { serverFunction } from "./serverFunctions";

export default function PayloadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootLayout
      config={config}
      htmlProps={{ lang: "en" }}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
