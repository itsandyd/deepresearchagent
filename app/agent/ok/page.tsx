export default function OkPage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">OK Page</h1>
        <p className="text-zinc-400 mb-4">
          Debug info: This page should show the navbar if layouts are working correctly.
        </p>
        <div className="bg-zinc-900 border-zinc-800 rounded-xl p-8">
          <p className="text-zinc-400">
            This page is designed to test the layout inheritance from app/agent/layout.tsx
          </p>
        </div>
      </div>
    </div>
  )
} 