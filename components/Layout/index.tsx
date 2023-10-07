import { PropsWithChildren } from 'react'

const Component: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {children}
      </div>
    </main>
  )
}
export default Component