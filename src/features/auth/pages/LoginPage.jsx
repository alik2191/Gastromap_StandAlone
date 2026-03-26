import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login, isLoading, error, clearError } = useAuthStore()
    const [showPassword, setShowPassword] = useState(false)

    // Form variants
    const formContainerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1, x: 0,
            transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        clearError()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        const result = await login(email, password)
        if (result.success) {
            navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
        }
    }

    return (
        <div className="min-h-screen w-full bg-white flex">
            {/* Left Side - Visual (Desktop only) */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-black text-white p-12 flex-col justify-between overflow-hidden">
                {/* Aurora Background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-60 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 w-fit px-4 py-2 rounded-full flex items-center gap-2 mb-8 backdrop-blur-md border border-white/10 text-white">
                        <img src="/pwa-icon-192.png" alt="GastroMap Logo" className="w-6 h-6 object-cover rounded-full" />
                        <span className="font-semibold text-sm">GastroMap</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-5xl font-bold leading-tight mb-8">
                            Curated flavors for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">modern palate.</span>
                        </h1>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">AI-Powered Recommendations</h3>
                                    <p className="text-sm text-gray-400">Personalized to your taste profile.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Exclusive Access</h3>
                                    <p className="text-sm text-gray-400">Book tables at top-tier venues.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 text-xs text-gray-500">
                    © 2025 GastroMap Inc.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 relative flex items-center justify-center p-6 bg-gray-50/50">
                {/* Back Button (Mobile/Desktop) */}
                <Link to="/" className="absolute top-8 left-8 lg:left-12 p-3 bg-white hover:bg-gray-100 rounded-full transition-colors group">
                    <ArrowLeft size={20} className="text-gray-900 group-hover:-translate-x-1 transition-transform" />
                </Link>

                <motion.div
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[420px] bg-white p-8 md:p-12 rounded-[40px] shadow-xl border border-gray-100"
                >
                    <motion.div variants={itemVariants} className="text-center mb-10">
                        <img src="/pwa-icon-192.png" alt="GastroMap Logo" className="w-12 h-12 object-cover rounded-full mx-auto mb-6 lg:hidden" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p className="text-gray-500">Please enter your details to sign in.</p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold text-gray-900 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label htmlFor="password" className="text-sm font-bold text-gray-900 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full h-12 pl-12 pr-12 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-black text-white rounded-full font-bold text-lg shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign in <ChevronRight size={18} /></>
                            )}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold tracking-wider">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.45c4.6657 0 8.4497-3.784 8.4497-8.4497 0-.743-.066-1.472-.191-2.179h-8.2587v4.12h4.721c-.204 1.1-.823 2.035-1.748 2.654l2.82 2.188c1.65-1.52 2.602-3.757 2.602-6.326 0-5.83-4.733-10.563-10.563-10.563-3.411 0-6.49 1.584-8.473 4.053l2.977 2.308c1.233-2.071 3.475-3.461 6.059-3.461z" fill="#EA4335" /><path d="M12.0003 3.55c3.411 0 6.49 1.584 8.473 4.053l-2.977 2.308c-1.233-2.071-3.475-3.461-6.059-3.461-4.6657 0-8.4497 3.784-8.4497 8.4497 0 .743.066 1.472.191 2.179h8.2587v-4.12h-4.721c.204-1.1.823-2.035 1.748-2.654l-2.82-2.188c-1.65 1.52-2.602 3.757-2.602 6.326 0 5.83 4.733 10.563 10.563 10.563 3.411 0 6.49-1.584 8.473-4.053l2.977-2.308c-1.233 2.071-3.475 3.461-6.059 3.461z" fill="#34A853" /><path d="M3.738 8.017l2.82 2.188c1.233-2.071 3.475-3.461 6.059-3.461-2.584 0-4.826 1.39-6.059 3.461" fill="#4285F4" /><path d="M20.258 16.483l-2.82-2.188c.925-.619 1.544-1.554 1.748-2.654" fill="#FBBC05" /></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 h-12 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.79 3.45 1.89-.9.49-2.5 1.15-2.5 3.24-.04 2.5 2.18 3.39 2.25 3.41-1.25 2.59-3.09 4.25-4.59 4.49zM12.01 4.22c-.22-1.39.81-2.92 2.17-3.47.16 1.48-.95 3.01-2.17 3.47z" /></svg>
                                Apple
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm">
                            Don't have an account? <Link to="/auth/signup" className="font-bold text-blue-600 hover:text-blue-700">Sign up free</Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default LoginPage
