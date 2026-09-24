import { createFileRoute } from '@tanstack/react-router'

const title = 'Sign in — SUPERINTELLIGENS'
const description =
  'Sign in to SUPERINTELLIGENS and turn a plain-language idea into a deployable app in minutes.'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: '/login' }],
  }),
  component: LoginPage,
})

import { AuthForm } from '@/components/auth/auth-form'
import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { Showcase } from '@/components/landing/showcase'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { People } from '@/components/landing/people'
import { PricingCta } from '@/components/landing/pricing-cta'
import { SiteFooter } from '@/components/landing/site-footer'

function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <main className="landing-page min-h-screen" aria-hidden>
        <div className="hero-pastel">
          <SiteHeader />
          <Hero />
        </div>
        <div className="landing-light">
          <Showcase />
          <Features />
          <HowItWorks />
          <People />
          <PricingCta />
          <SiteFooter />
        </div>
      </main>

      <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="login-light pointer-events-auto w-full max-w-[420px]">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
