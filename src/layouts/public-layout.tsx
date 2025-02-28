import { Outlet } from "react-router-dom"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const PublicLayout = () => {
  return (
    <div className='w-full'>
        {/* handler to store user data */}
        <Header />

        <Outlet />

        <Footer />
    </div>
  )
}