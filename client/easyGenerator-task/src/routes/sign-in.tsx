import { LoginForm } from '@/components/sign-in/login-form'
import { GlyphBackground } from '@/components/animate-ui/backgrounds/glyph'
import { createFileRoute } from '@tanstack/react-router'
import { LibraryBig } from "lucide-react"


export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
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
      </div>
    </div>

}
