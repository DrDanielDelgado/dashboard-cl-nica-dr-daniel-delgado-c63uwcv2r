import { Bell, Search, MapPin, UserCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

export function AppHeader() {
  const { location, setLocation, role } = useAppStore()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md">
      <SidebarTrigger className="md:hidden" />

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2 max-w-xs w-full">
          <MapPin className="h-5 w-5 text-muted-foreground hidden sm:block" />
          <Select value={location} onValueChange={(val: any) => setLocation(val)}>
            <SelectTrigger className="w-[180px] bg-background border-none shadow-none font-semibold text-primary">
              <SelectValue placeholder="Selecione a Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
              <SelectItem value="Contagem">Contagem</SelectItem>
              <SelectItem value="Betim">Betim</SelectItem>
              <SelectItem value="Uberlândia">Uberlândia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes, agendamentos..."
            className="w-full bg-muted/50 pl-9 rounded-full border-none focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive animate-pulse-soft"></span>
        </Button>
        <div className="hidden sm:flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">Dra. Silva</p>
            <Badge variant="secondary" className="mt-1 text-[10px] uppercase">
              {role}
            </Badge>
          </div>
          <Avatar>
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
