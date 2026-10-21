import { LoginForm } from '@/components/sign-in/login-form'
import { GlyphBackground } from '@/components/animate-ui/backgrounds/glyph'
import { createFileRoute } from '@tanstack/react-router'
import { LibraryBig } from "lucide-react"
import heroImage from '@/assets/easygenerator-hero.png'
import processImage from '@/assets/easygenerator-process.png'
import kvImage from '@/assets/easygenerator-kv.png'
import kvSecondImage from '@/assets/easygenerator-kv-2.png'
import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const heroImages = [heroImage, kvImage, kvSecondImage]

const brandShapePath = 'M8.3851 40.394C-2.78328 34.0299 -2.74884 7.70101 8.21193 1.51847C19.1727 -4.66408 41.9104 9.26554 41.9104 21.1043C41.9104 32.943 19.5535 46.7581 8.3851 40.394Z'
const bubblePaths = [
  brandShapePath,
  'M13 39C0 40 -3 14 5 6C15 -5 37 3 41 16C46 30 27 43 13 39Z',
  'M6 33C-3 24 3 3 15 2C30 0 44 15 39 28C35 42 15 47 6 33Z',
  brandShapePath,
]


export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const imageClipId = useId()
  const reduceMotion = useReducedMotion()
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    // Preload each frame so crossfades never reveal an unloaded image.
    heroImages.forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveImage((current) => (current + 1) % heroImages.length)
      }
    }, 5000)
    return () => window.clearInterval(interval)
  }, [reduceMotion])
  const shapeAnimation = reduceMotion ? undefined : { d: bubblePaths }
  const shapeTransition = { duration: 9, repeat: Infinity, ease: 'easeInOut' as const }
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
          <motion.svg
            viewBox="0 0 42 42"
            role="img"
            aria-label="Easygenerator learning and product imagery"
            className="w-full max-w-xl overflow-visible drop-shadow-2xl"
          >
            <defs>
              <clipPath id={imageClipId}>
                <motion.path d={brandShapePath} animate={shapeAnimation} transition={shapeTransition} />
              </clipPath>
            </defs>
            <motion.path d={brandShapePath} animate={shapeAnimation} transition={shapeTransition} className="fill-brand" />
            <g transform="translate(1 -3) scale(1.08)">
              <AnimatePresence initial={false}>
              <motion.image
                key={activeImage}
                href={heroImages[activeImage]}
                width="42"
                height="42"
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${imageClipId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 1.2, ease: 'easeInOut' }}
              />
              </AnimatePresence>
            </g>
          </motion.svg>
        </div>
      </div>
    </div>

}
