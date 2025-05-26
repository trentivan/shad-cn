"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  Building,
  CameraIcon,
  ClipboardCheck,
  FileCodeIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ListIcon,
  Sailboat,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"

import { NavDocuments } from "@/components/vistasShadcn/nav-documents"
import { NavMain } from "@/components/vistasShadcn/nav-main"
import { NavUser } from "@/components/vistasShadcn/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "#",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Gestión",
      url: "/usuarios",
      icon: ListIcon,
      items: [
        {
          title: "Usuarios",
          url: "/usuarios",
          icon: User,
        },
        {
          title: "Buques",
          url: "/buques",
          icon: Sailboat,
        },
        {
          title: "Agencias",
          url: "/agencias",
          icon: Building,
        },
      ],
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  // documents: [
  //   {
  //     name: "TODO",
  //     url: "#",
  //     icon: ClipboardCheck,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = useState<string>("admin") // Valor por defecto

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserRole(user.rol || "externo")
        } catch {
          setUserRole("externo")
        }
      } else {
        setUserRole("externo")
      }
    }
  }, [])

  // Filtra navMain para ocultar "Gestión" si no es admin
  const navMainFiltrado = data.navMain.filter(
    item => item.title !== "Gestión" || userRole === "admin"
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Sistema empresarial
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainFiltrado} />
        {/* <NavDocuments items={data.documents} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
