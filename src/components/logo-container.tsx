import { Link } from 'react-router-dom'

export const LogoContainer = () => {
  return (
    <Link to = {"/"}>
        <img src = "/assets/svg/logo.svg" alt = "logo" className = "flex gap-7 items-center" />
    </Link>
  )
}
