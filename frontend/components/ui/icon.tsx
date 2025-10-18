"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = (LucideIcons as Record<string, LucideIcon>)[
    name.charAt(0).toUpperCase() + name.slice(1)
  ] as LucideIcon;

  if (!IconComponent) {
    return <LucideIcons.Target className={className} />;
  }

  return <IconComponent className={className} />;
}
