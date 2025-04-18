import { Link } from 'react-router-dom'

export const LogoContainer = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 mr-6">
      <svg
        className="w-5 h-5 md:w-6 md:h-6"
        viewBox="0 0 40 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 5 L12 30 H18 L10 55 L32 25 H24 L30 5 Z" fill="#818cf8" />
      </svg>
      <span className="text-black text-xl md:text-2xl font-bold">IntervAI</span>
    </Link>
  )
}
