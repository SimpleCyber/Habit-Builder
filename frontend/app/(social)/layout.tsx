import { SocialLayout } from "@/components/layout/social-layout";
import { ReactNode } from "react";

export default function SocialRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SocialLayout>{children}</SocialLayout>;
}
