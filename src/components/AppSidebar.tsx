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
  MessageSquareShare,
  Headset,
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
import { useAppStore } from '@/stores/app'

export function AppSidebar() {
  const location = useLocation()
  const { role } = useAppStore()

  const isSecretary = role === 'Secretária'

  const navItems = [
    {
      title: isSecretary ? 'Recepção (Início)' : 'Dashboard',
      icon: isSecretary ? Headset : LayoutDashboard,
      url: isSecretary ? '/atendimento' : '/',
      roles: ['all'],
    },
    { title: 'Agenda', icon: CalendarDays, url: '/agenda', roles: ['all'] },
    {
      title: 'Financeiro',
      icon: CircleDollarSign,
      url: '/financeiro',
      roles: ['Administrador', 'Gerente', 'Gerenciador', 'Médico', 'Contador'],
    },
    {
      title: 'Estoque',
      icon: Package,
      url: '/estoque',
      roles: ['Administrador', 'Gerente', 'Gerenciador', 'Enfermeira', 'Médico'],
    },
    {
      title: 'CRM & Social',
      icon: Users,
      url: '/crm',
      roles: ['Administrador', 'Gerente', 'Gerenciador'],
    },
    {
      title: 'Chatbot',
      icon: MessageSquareShare,
      url: '/chatbot',
      roles: ['Administrador', 'Gerente', 'Gerenciador'],
    },
    {
      title: 'Prontuários',
      icon: Stethoscope,
      url: '/prontuario',
      roles: ['Administrador', 'Gerente', 'Gerenciador', 'Médico', 'Enfermeira'],
    },
    {
      title: 'Automações',
      icon: Bot,
      url: '/automacoes',
      roles: ['Administrador', 'Gerente', 'Gerenciador'],
    },
    {
      title: 'Documentos',
      icon: FileText,
      url: '/documentos',
      roles: ['Administrador', 'Gerente', 'Gerenciador', 'Médico'],
    },
    { title: 'Equipe', icon: FileBox, url: '/equipe', roles: ['all'] },
    {
      title: 'Configurações',
      icon: Settings,
      url: '/configuracoes',
      roles: ['Administrador', 'Gerente', 'Gerenciador'],
    },
  ]

  const filteredNav = navItems.filter(
    (item) => item.roles.includes('all') || item.roles.includes(role),
  )

  return (
    <Sidebar variant="inset" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground truncate">
            Dr. Daniel Delgado
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          {filteredNav.map((item) => {
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
