import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Tennis Player Development
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive platform for tennis player development and coaching
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to Your Tennis Journey
          </h2>
          <p className="text-gray-600">
            This platform will help players, coaches, and parents track progress,
            set goals, and achieve tennis excellence through data-driven development.
          </p>
        </div>
        <Link href="/about" className="text-blue-600 underline mb-4 inline-block">
          Learn more about this project
        </Link>
        <div className="text-sm text-gray-500">
          Built with Next.js, TypeScript, and Tailwind CSS
        </div>
      </div>
    </main>
  )
}