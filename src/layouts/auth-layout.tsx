import { Outlet } from 'react-router-dom'
const AuthenticationLayout = () => {
    return (
        <div className='w-screen h-screen overflow-hidden flex justify-center items-center'>
            <img src = "/assets/img/bg.png" alt = "background" className = "absolute w-screen h-screen object-cover opacity-25" /> 
            <Outlet />
        </div>
    )
}

export default AuthenticationLayout