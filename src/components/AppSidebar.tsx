import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Megaphone,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Pipeline CRM', icon: Users, url: '/crm' },
  { title: 'Agenda', icon: Calendar, url: '/agenda' },
  { title: 'Prontuário 360', icon: Activity, url: '/prontuario' },
  { title: 'Financeiro', icon: CreditCard, url: '/financeiro' },
  { title: 'Estoque', icon: Package, url: '/estoque' },
  { title: 'Automações & MKT', icon: Megaphone, url: '/automations' },
]

const bottomNavItems = [{ title: 'Configurações', icon: Settings, url: '/configuracoes' }]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar className="border-r border-sidebar-border shadow-xl z-50">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-background py-6">
        <Link to="/">
          <div
            className={cn(
              'flex items-center justify-center rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg',
              isCollapsed ? 'mx-auto h-12 w-12 p-2' : 'mx-4 h-24 w-auto p-4',
            )}
          >
            <img
              src={brandLogo}
              alt="Dr. Daniel Delgado"
              className="h-full w-full object-contain drop-shadow-sm"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold tracking-wider text-xs uppercase mb-2">
            Gestão Integrada
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {mainNavItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'transition-all duration-200 rounded-lg py-5',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'h-5 w-5',
                            isActive
                              ? 'text-white'
                              : 'text-sidebar-foreground/70 group-hover:text-white',
                          )}
                        />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'transition-all duration-200 rounded-lg py-5',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={cn(
                            'h-5 w-5',
                            isActive
                              ? 'text-white'
                              : 'text-sidebar-foreground/70 group-hover:text-white',
                          )}
                        />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
