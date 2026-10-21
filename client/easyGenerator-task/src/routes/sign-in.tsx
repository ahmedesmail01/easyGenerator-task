import { LoginForm } from '@/components/sign-in/login-form'
import { GlyphBackground } from '@/components/animate-ui/backgrounds/glyph'
import { createFileRoute } from '@tanstack/react-router'
import { LibraryBig } from "lucide-react"
import heroImage from '@/assets/easygenerator-hero.png'
import { useId } from 'react'

const brandShapePath = 'M8.3851 40.394C-2.78328 34.0299 -2.74884 7.70101 8.21193 1.51847C19.1727 -4.66408 41.9104 9.26554 41.9104 21.1043C41.9104 32.943 19.5535 46.7581 8.3851 40.394Z'


export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const imageClipId = useId()
  // Build the sign-in UI here.
  return <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {/* <GalleryVerticalEnd  /> */}
              <LibraryBig className="size-4 text-secondary" />
            </div>
            Easygenerator
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-[radial-gradient(ellipse_at_top_right,#674538_0%,#363e4e_45%,#191e28_100%)] lg:block">
        <GlyphBackground
          aria-hidden="true"
          className="absolute inset-0 text-white"
          glowColor="#ffffff"
          shapeColor="#fce2da"
          fontSize={12}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,transparent_35%,#191e28_100%)] opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-12">
          <svg
            viewBox="0 0 42 42"
            role="img"
            aria-label="A learner working on a laptop"
            className="w-full max-w-md overflow-visible drop-shadow-2xl"
          >
            <defs>
              <clipPath id={imageClipId}>
                <path d={brandShapePath} />
              </clipPath>
            </defs>
            <path d={brandShapePath} className="fill-brand" />
            <g transform="translate(1 -3) scale(1.08)">
              <image
                href={heroImage}
                width="42"
                height="42"
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${imageClipId})`}
              />
            </g>
          </svg>
        </div>
      </div>
    </div>

}
