import { Link } from 'react-router'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1
            className="text-[20vw] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #cd7f32 0%, #8c5220 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.5,
            }}
          >
            404
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-[#b0b0b0] mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved. Check the URL or navigate back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-[#cd7f32] hover:bg-[#e8c07e] transition-all"
            style={{ borderRadius: '50px' }}
          >
            <Zap className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:border-[#cd7f32] transition-all"
            style={{ borderRadius: '50px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
