"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LucideIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";

interface NavMainProps {
  items: {
    title: string;
    url?: string;
    icon: LucideIcon;
    items?: { title: string; url: string, icon?: LucideIcon }[];
  }[];
}

export function NavMain({ items }: NavMainProps) {
  const [isOpen, setIsOpen] = React.useState<string | null>(null); // Estado para controlar qué desplegable está abierto

  const toggleDropdown = (title: string) => {
    setIsOpen((prevOpen) => (prevOpen === title ? null : title));
  };

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.items ? (
            <div className="space-y-1">
              <SidebarMenuButton
                className="flex items-center justify-between w-full gap-2 text-sm font-medium"
                onClick={() => toggleDropdown(item.title)}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {isOpen === item.title ? (
                  <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </SidebarMenuButton>
              {isOpen === item.title && (
                <ul className="pl-6 mt-1 space-y-1">
                  {item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.title} className="pl-2">
                      <SidebarMenuButton asChild>
                        <Link href={subItem.url} className="gap-2 text-sm">
                          {subItem.icon && <subItem.icon className="h-4 w-4" />} {/* Renderizar el icono del sub-elemento */}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <SidebarMenuButton asChild>
              <Link href={item.url || "#"} className="gap-2 text-sm font-medium">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}