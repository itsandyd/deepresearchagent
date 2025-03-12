export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Dashboard Layout Container */}
      {children}
    </div>
  )
} 