import { useState } from 'react'
import { Link } from 'react-router'
import { Zap, Chrome, Apple, Facebook, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL
  const appID = import.meta.env.VITE_APP_ID
  const redirectUri = `${window.location.origin}/api/oauth/callback`
  const state = btoa(redirectUri)

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`)
  url.searchParams.set('client_id', appID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'profile')
  url.searchParams.set('state', state)

  return url.toString()
}

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For demo, redirect to OAuth
    window.location.href = getOAuthUrl()
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(205, 127, 50, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(205, 127, 50, 0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-[#cd7f32]" />
            <span className="text-2xl font-bold text-white">
              KOD<span className="text-[#cd7f32]">Works</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-[#b0b0b0]">
            {mode === 'login'
              ? 'Sign in to access your trading dashboard'
              : 'Start your algorithmic trading journey'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8">
          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-3"
              onClick={() => { window.location.href = getOAuthUrl() }}
            >
              <Chrome className="w-5 h-5 text-[#cd7f32]" />
              Continue with Google
            </Button>
            <Button
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-3"
              onClick={() => { window.location.href = getOAuthUrl() }}
            >
              <Apple className="w-5 h-5 text-white" />
              Continue with Apple
            </Button>
            <Button
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-3"
              onClick={() => { window.location.href = getOAuthUrl() }}
            >
              <Facebook className="w-5 h-5 text-blue-400" />
              Continue with Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#b0b0b0]">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-[#b0b0b0] mb-1 block">Full Name</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#0e0e10] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b0b0b0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#0e0e10] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#b0b0b0] mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0e0e10] border border-white/10 pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#b0b0b0]/50 focus:border-[#cd7f32] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[#cd7f32]" />
                  <span className="text-xs text-[#b0b0b0]">Remember me</span>
                </label>
                <button type="button" className="text-xs text-[#cd7f32] hover:text-[#e8c07e]">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#cd7f32] hover:bg-[#e8c07e] text-black font-semibold"
              style={{ borderRadius: '50px' }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-[#b0b0b0] mt-6">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-[#cd7f32] hover:text-[#e8c07e] font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#cd7f32] hover:text-[#e8c07e] font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[#b0b0b0]/40 mt-6 max-w-sm mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          All trading is conducted in Deriv demo environment only.
        </p>
      </div>
    </div>
  )
}
