import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Workflow,
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
  { title: 'Agenda', icon: Calendar, url: '/agenda' },
  { title: 'Pacientes', icon: Users, url: '/pacientes' },
  { title: 'Prontuários', icon: Activity, url: '/prontuarios' },
  { title: 'Financeiro', icon: CreditCard, url: '/financeiro' },
  { title: 'Estoque', icon: Package, url: '/estoque' },
  { title: 'Automações', icon: Workflow, url: '/automations' },
]

const bottomNavItems = [{ title: 'Configurações', icon: Settings, url: '/settings' }]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar className="border-r border-sidebar-border shadow-md">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar-background py-5">
        <div
          className={cn(
            'flex items-center justify-center rounded-lg bg-white shadow-sm transition-all duration-300',
            isCollapsed ? 'mx-auto h-10 w-10 p-1' : 'mx-4 h-20 w-auto p-3',
          )}
        >
          <img src={brandLogo} alt="Dr. Daniel Delgado" className="h-full w-full object-contain" />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
                        'transition-colors duration-200',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
