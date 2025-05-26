import  CuentaPage  from "@/components/cuenta/page"
import { AppSidebar } from "@/components/vistasShadcn/app-sidebar"
import { SiteHeader } from "@/components/vistasShadcn/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              <div className="px-4 lg:px-6">
                {/* <ChartAreaInteractive /> */}
              </div>
              <CuentaPage />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}