import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import { MaintenanceGuard } from '@/components/guards/MaintenanceGuard'
import { ErrorBoundary, MapErrorFallback, AIChatErrorFallback, RouteErrorFallback } from '@/app/ErrorBoundary'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'

// ─── Auth guards — must be non-lazy so check runs before chunk loads ──────
const RequireAuth = () => {
    const { isAuthenticated } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <Outlet />
}

const RequireAdmin = () => {
    const { user, isAuthenticated } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
    return <Outlet />
}

// ─── CRITICAL PUBLIC PAGES (no lazy loading) ───────────────────────────────
import LandingPage from '@/features/public/pages/LandingPage'

// ─── LAZY: Public pages (rarely visited from cold start) ───────────────────
const FeaturesPage = lazy(() => import('@/features/public/pages/FeaturesPage'))
const PricingPage = lazy(() => import('@/features/public/pages/PricingPage'))
const AboutPage = lazy(() => import('@/features/public/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage'))
const PublicPage = lazy(() => import('@/features/public/pages/PublicPage'))
const LocationDetailsPage = lazy(() => import('@/features/public/pages/LocationDetailsPage'))

// ─── LAZY: Auth pages ──────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage'))

// ─── LAZY: Dashboard pages ─────────────────────────────────────────────────
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AddPlacePage = lazy(() => import('@/features/dashboard/pages/AddPlacePage'))
const LeaderboardPage = lazy(() => import('@/features/dashboard/pages/LeaderboardPage'))
const ProfilePage = lazy(() => import('@/features/dashboard/pages/ProfilePage'))
const ProfileEditPage = lazy(() => import('@/features/dashboard/pages/ProfileEditPage'))
const LanguageSettingsPage = lazy(() => import('@/features/dashboard/pages/LanguageSettingsPage'))
const SecurityPrivacyPage = lazy(() => import('@/features/dashboard/pages/SecurityPrivacyPage'))
const DeleteDataPage = lazy(() => import('@/features/dashboard/pages/DeleteDataPage'))
const HelpCenterPage = lazy(() => import('@/features/dashboard/pages/HelpCenterPage'))
const TermsPage = lazy(() => import('@/features/dashboard/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/features/dashboard/pages/PrivacyPage'))
const CookiePolicyPage = lazy(() => import('@/features/dashboard/pages/CookiePolicyPage'))
const AIGuidePage = lazy(() => import('@/features/dashboard/pages/AIGuidePage'))
const SavedPage = lazy(() => import('@/features/dashboard/pages/SavedPage'))
const VisitedPage = lazy(() => import('@/features/dashboard/pages/VisitedPage'))
const ExploreWrapper = lazy(() => import('@/features/dashboard/pages/ExploreWrapper'))

// ─── LAZY: Admin pages ─────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('@/features/admin/layout/AdminLayout'))
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'))
const AdminLocationsPage = lazy(() => import('@/features/admin/pages/AdminLocationsPage'))
const AdminModerationPage = lazy(() => import('@/features/admin/pages/AdminModerationPage'))
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'))
const AdminSubscriptionsPage = lazy(() => import('@/features/admin/pages/AdminSubscriptionsPage'))
const AdminAIPage = lazy(() => import('@/features/admin/pages/AdminAIPage'))
const AdminStatsPage = lazy(() => import('@/features/admin/pages/AdminStatsPage'))
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage'))

// ─── Fallback UI while a page chunk loads ──────────────────────────────────
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
)

export const AppRouter = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Standalone Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/signup" element={<SignUpPage />} />

                {/* Public Routes (Wrapped in PublicLayout) */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Generic Pages */}
                    <Route path="/api" element={<PublicPage title="API Documentation" subtitle="Build on top of GastroMap." />} />
                    <Route path="/showcase" element={<PublicPage title="Showcase" subtitle="See what others are discovering." />} />
                    <Route path="/careers" element={<PublicPage title="Careers" subtitle="Join our team." />} />
                    <Route path="/blog" element={<PublicPage title="Blog" subtitle="Stories from the kitchen." />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/security" element={<SecurityPrivacyPage />} />
                    <Route path="/cookies" element={<CookiePolicyPage />} />
                    <Route path="/help" element={<HelpCenterPage />} />
                    <Route path="/status" element={<PublicPage title="System Status" subtitle="All systems operational." />} />
                    <Route path="/community" element={<PublicPage title="Community" subtitle="Join the conversation." />} />
                </Route>

                {/* Public App Routes — no auth needed (explore, location details) */}
                <Route element={<MaintenanceGuard><MainLayout /></MaintenanceGuard>}>
                    <Route path="/explore" element={<ErrorBoundary fallback={({ error, reset }) => <RouteErrorFallback error={error} reset={reset} />}><ExploreWrapper /></ErrorBoundary>} />
                    <Route path="/explore/:country" element={<ErrorBoundary fallback={({ error, reset }) => <RouteErrorFallback error={error} reset={reset} />}><ExploreWrapper /></ErrorBoundary>} />
                    <Route path="/explore/:country/:city" element={<ErrorBoundary fallback={({ error, reset }) => <RouteErrorFallback error={error} reset={reset} />}><ExploreWrapper /></ErrorBoundary>} />
                    <Route path="/location/:id" element={<ErrorBoundary fallback={({ error, reset }) => <RouteErrorFallback error={error} reset={reset} />}><LocationDetailsPage /></ErrorBoundary>} />

                    {/* Private App Routes — requires authentication */}
                    <Route element={<RequireAuth />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/dashboard/add-place" element={<AddPlacePage />} />
                        <Route path="/dashboard/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/edit" element={<ProfileEditPage />} />
                        <Route path="/profile/language" element={<LanguageSettingsPage />} />
                        <Route path="/profile/security" element={<SecurityPrivacyPage />} />
                        <Route path="/privacy/delete-request" element={<DeleteDataPage />} />
                        <Route
                            path="/ai-guide"
                            element={
                                <ErrorBoundary fallback={({ error, reset }) => <AIChatErrorFallback reset={reset} />}>
                                    <AIGuidePage />
                                </ErrorBoundary>
                            }
                        />
                        <Route path="/saved" element={<SavedPage />} />
                        <Route path="/visited" element={<VisitedPage />} />
                        <Route
                            path="/map"
                            element={
                                <ErrorBoundary fallback={({ error, reset }) => <MapErrorFallback error={error} reset={reset} />}>
                                    <div className="p-4">Map View (Coming Soon)</div>
                                </ErrorBoundary>
                            }
                        />
                    </Route>
                </Route>

                {/* Admin Routes — protected: requires role === 'admin' */}
                <Route element={<RequireAdmin />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="locations" element={<AdminLocationsPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                        <Route path="moderation" element={<AdminModerationPage />} />
                        <Route path="ai" element={<AdminAIPage />} />
                        <Route path="stats" element={<AdminStatsPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    )
}
