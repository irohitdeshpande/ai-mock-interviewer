import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@clerk/clerk-react"
import { NavigationRoutes } from "./navigation-routes"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

export const ToggleContainer = () => {
  const { userId } = useAuth()
  return (
    <Sheet>
      <SheetTrigger className="block">
        <Menu className="w-6 h-6 text-indigo-600 md:hidden" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle />
        </SheetHeader>
        <nav className = "items-start flex flex-col gap-5">
        <NavigationRoutes isMobile />
        {userId && (
          <NavLink to='/interview' className={({ isActive }) => cn("text-base text-neutral-600", isActive && "text-indigo-900 font-semibold"
          )}>
            Take an Interview
          </NavLink>
        )}
        </nav>
      </SheetContent>
    </Sheet>

  )
}
