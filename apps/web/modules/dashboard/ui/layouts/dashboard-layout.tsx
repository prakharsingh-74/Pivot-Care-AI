import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import { Provider } from "jotai"
import { cookies } from "next/headers"

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  //using SIDEBAR_COOKIE_NAME from @workspace/ui/components/sidebar
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <AuthGuard>
      <OrganizationGuard>
        <Provider>
        <SidebarProvider defaultOpen={defaultOpen} className="overflow-x-hidden max-w-full w-full min-w-0">
          <DashboardSidebar />
          <main className="flex flex-1 flex-col min-w-0 max-w-full overflow-x-hidden">
            {children}
          </main>
        </SidebarProvider>
        </Provider>
      </OrganizationGuard>
    </AuthGuard>
  )
}