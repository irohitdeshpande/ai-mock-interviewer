import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/clerk-react"
import { Container } from "./container";
import { LogoContainer } from "./logo-container";
import { NavigationRoutes } from "./navigation-routes";
import { NavLink } from "react-router-dom";
import { ProfileContainer } from "./profile-container";
import { ToggleContainer } from "./toggle-container";
// responsive header component

const Header = () => {
  const { userId } = useAuth()
  return (
    <header className={cn('w-full border-b duration-150 transition-all ease-in-out')}>
      <Container>
        <div className='flex items-center w-full'>

          {/* logo section */}
          <LogoContainer />

          {/* navigation section */}
          <nav className='hidden md:flex items-center gap-7'>
            <NavigationRoutes />
            {userId && (
              <NavLink to='/interview' className={({ isActive }) => cn("text-base text-neutral-600", isActive && "text-indigo-900 font-semibold"
              )}>
                Take an Interview
              </NavLink>
            )}
          </nav>


          {/* profile section */}
          <div className = "ml-auto flex items-center gap-7">
            {/* profile section */}
              <ProfileContainer />
            {/* mobile toggle section */}
              <ToggleContainer />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header