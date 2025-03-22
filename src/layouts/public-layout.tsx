import { Outlet } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthHandler from "@/handlers/auth-handler"

export const PublicLayout = () => {
  return (
    <div className='w-full'>
      {/* handler to store user data */}
      <AuthHandler />
      <Header />

      <Outlet />

      <Footer />
    </div>
  )
}