import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  CircleDollarSign,
  Package,
  Users,
  FileText,
  FileBox,
  Stethoscope,
  Settings,
  Bot,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
  { title: 'Agenda', icon: CalendarDays, url: '/agenda' },
  { title: 'Financeiro', icon: CircleDollarSign, url: '/financeiro' },
  { title: 'Estoque', icon: Package, url: '/estoque' },
  { title: 'CRM & Social', icon: Users, url: '/crm' },
  { title: 'Prontuários', icon: Stethoscope, url: '/prontuario' },
  { title: 'Automações', icon: Bot, url: '/automacoes' },
  { title: 'Documentos', icon: FileText, url: '/documentos' },
  { title: 'Equipe', icon: FileBox, url: '/equipe' },
  { title: 'Configurações', icon: Settings, url: '/configuracoes' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground truncate">
            Clínica Integrada
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center w-full">Versão 1.0.1</div>
      </SidebarFooter>
    </Sidebar>
  )
}
