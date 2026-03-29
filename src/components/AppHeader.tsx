import { useState } from 'react'
import { Bell, Search, MapPin } from 'lucide-react'
import { GlobalSearch } from './GlobalSearch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/stores/app'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import brandLogo from '@/assets/captura-de-tela-2026-03-15-as-21.39.36-d4190.png'

export function AppHeader() {
  const { location, setLocation, role } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4 md:hidden">
        <SidebarTrigger />
        <img src={brandLogo} alt="Dr. Daniel Delgado" className="h-8 w-auto object-contain" />
      </div>

      {/* Spacer for desktop to align with sidebar correctly if needed, otherwise hidden */}
      <SidebarTrigger className="hidden md:flex" />

      <div className="flex flex-1 items-center gap-4 md:gap-8 ml-auto">
        <div className="flex items-center gap-2 max-w-[220px] w-full ml-auto md:ml-0">
          <MapPin className="h-5 w-5 text-brand-red hidden sm:block" />
          <Select value={location} onValueChange={(val: any) => setLocation(val)}>
            <SelectTrigger className="w-full bg-muted/50 border-none shadow-none font-semibold text-brand-blue hover:bg-muted focus:ring-brand-blue/20">
              <SelectValue placeholder="Selecione a Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Juiz de Fora" className="font-medium">
                Juiz de Fora
              </SelectItem>
              <SelectItem value="Leopoldina" className="font-medium">
                Leopoldina
              </SelectItem>
              <SelectItem value="Além Paraíba" className="font-medium">
                Além Paraíba
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between bg-muted/40 text-sm text-muted-foreground pl-10 pr-3 py-2.5 rounded-full border border-transparent hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <span>Buscar pacientes, consultas, relatórios...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-sm opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-brand-blue hover:bg-brand-blue/5"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-brand-red ring-2 ring-background"></span>
        </Button>
        <div className="hidden sm:flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-blue leading-none">Dr. Daniel Delgado</p>
            <Badge
              variant="outline"
              className="mt-1.5 text-[10px] uppercase font-bold text-brand-red border-brand-red/20 bg-brand-red/5"
            >
              {role}
            </Badge>
          </div>
          <Avatar className="border-2 border-brand-blue/10">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4" />
            <AvatarFallback className="bg-brand-blue text-white font-bold">DD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
