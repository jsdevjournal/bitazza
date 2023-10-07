import { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const Component: React.FC<PropsWithChildren<ButtonProps>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
export default Component