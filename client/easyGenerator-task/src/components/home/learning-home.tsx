import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowDown, ArrowRight, ArrowUp, Check, ChevronRight, FileText, Globe2, GripVertical, Layers3, LibraryBig, LogOut, MousePointer2, Play, Plus, Sparkles, WandSparkles } from 'lucide-react'
import heroImage from '@/assets/easygenerator-hero.png'
import { Button } from '@/components/ui/button'

const initialBlocks = [
  { id: 'intro', label: 'A warm welcome', type: 'Introduction', icon: FileText },
  { id: 'lesson', label: 'Make your first move', type: 'Interactive lesson', icon: Play },
  { id: 'quiz', label: 'Put it into practice', type: 'Knowledge check', icon: Check },
]

function CoursePreview() {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [selected, setSelected] = useState('intro')
  const [dragged, setDragged] = useState<string | null>(null)
  const active = blocks.find((block) => block.id === selected)!

  function move(id: string, destination: number) {
    setBlocks((current) => {
      const source = current.findIndex((block) => block.id === id)
      if (destination < 0 || destination >= current.length) return current
      const next = [...current]
      const [item] = next.splice(source, 1)
      next.splice(destination, 0, item)
      return next
    })
  }

  return <div id="workspace" className="scroll-mt-28 rounded-[1.75rem] border border-black/10 bg-white p-2 shadow-[0_24px_80px_-24px_rgba(54,62,78,0.25)]">
    <div className="flex items-center justify-between gap-3 border-b border-black/5 px-3 py-4 sm:px-5">
      <div className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 rounded-full bg-brand" /> Your learning studio</div>
      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Interactive preview</span>
    </div>
    <div className="grid sm:min-h-[390px] sm:grid-cols-[185px_1fr]">
      <div className="border-b border-black/5 bg-[#faf9f7] p-3 sm:rounded-bl-3xl sm:border-r sm:border-b-0">
        <p className="mb-4 px-2 pt-2 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">Your course outline</p>
        <div className="space-y-2">
          {blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setDragged(block.id)} onDragEnd={() => setDragged(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (dragged) move(dragged, index); setDragged(null) }} className={`group flex items-center gap-1 rounded-xl border p-2 ${selected === block.id ? 'border-brand/40 bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
            <GripVertical aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
            <button type="button" onClick={() => setSelected(block.id)} aria-pressed={selected === block.id} className="min-w-0 flex-1 rounded text-left focus-visible:outline-2 focus-visible:outline-brand">
              <span className="block text-[10px] text-muted-foreground">0{index + 1} · {block.type}</span>
              <span className="block text-xs font-medium leading-5">{block.label}</span>
            </button>
            <div className="flex flex-col">
              <button type="button" disabled={index === 0} onClick={() => move(block.id, index - 1)} aria-label={`Move ${block.label} up`} className="rounded p-0.5 hover:bg-brand-soft disabled:opacity-20"><ArrowUp className="size-3" /></button>
              <button type="button" disabled={index === blocks.length - 1} onClick={() => move(block.id, index + 1)} aria-label={`Move ${block.label} down`} className="rounded p-0.5 hover:bg-brand-soft disabled:opacity-20"><ArrowDown className="size-3" /></button>
            </div>
          </div>)}
        </div>
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-dashed border-brand/50 p-3 text-xs leading-5 text-muted-foreground"><MousePointer2 className="mt-1 size-3 shrink-0 text-foreground" />Drag blocks to reorder, or use the arrows.</div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><span className="text-[10px] tracking-widest text-muted-foreground uppercase">Sample course · Onboarding</span><Layers3 className="size-4 text-muted-foreground" /></div>
        <div className="relative mb-5 h-36 overflow-hidden rounded-2xl bg-brand-soft">
          <img src={heroImage} alt="A learner creating training on a laptop" className="h-full w-full object-cover object-[center_55%]" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium">A great start begins here</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><active.icon className="size-3.5 text-brand" />{active.type}</div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{active.label}</h3>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">{selected === 'intro' ? 'Give every new teammate a confident start. Bring your culture, people, and big ideas into one welcoming learning experience.' : selected === 'lesson' ? 'Break a big idea into small, memorable steps. Combine text, images, and video to make learning feel natural.' : 'Turn a lesson into lasting knowledge. Help your learners reflect, practise, and see how far they have come.'}</p>
        <div className="mt-5 flex items-center gap-2 border-t border-black/5 pt-4 text-[11px] text-muted-foreground"><Sparkles className="size-3.5 text-brand" />Imagine your expertise, with an AI co-author.</div>
      </div>
    </div>
  </div>
}

type LearningHomeProps = {
  user?: { name: string; email: string }
  welcomeMessage?: string
  onLogout?: () => Promise<void>
  loggingOut?: boolean
  error?: string
}

export function LearningHome({ user, welcomeMessage, onLogout, loggingOut, error }: LearningHomeProps) {
  return <div className="min-h-svh bg-[#fdfcf9] text-[#171719]">
    <header className="border-b border-black/5 bg-white/80">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"><span className="flex size-8 items-center justify-center rounded-xl bg-brand"><LibraryBig className="size-5 text-white" /></span>Easygenerator</Link>
        <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"><a href="#how-it-works" className="hover:text-foreground">How it works</a><a href="#possibilities" className="hover:text-foreground">Made for your ideas</a></div>
        <div className="flex items-center gap-3">
          {user ? <><span className="hidden text-sm text-muted-foreground sm:block">Hi, {user.name.split(' ')[0]}</span><Button variant="outline" disabled={loggingOut} onClick={() => { void onLogout?.() }}><LogOut className="size-4" /><span>{loggingOut ? 'Logging out…' : 'Log out'}</span></Button></> : <><Link to="/sign-in" className="text-xs font-medium sm:text-sm">Log in</Link><Link to="/sign-up" className="rounded-full bg-brand px-3 py-2.5 text-xs font-medium hover:bg-brand-hover sm:px-4 sm:text-sm">Get started <ArrowRight className="ml-1 inline size-4" /></Link></>}
        </div>
      </nav>
    </header>
    <main>
      {error && <p role="alert" className="mx-auto max-w-7xl px-5 pt-5 text-sm text-destructive">{error}</p>}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-12 pb-16 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft/40 px-3.5 py-2 text-xs font-medium"><Sparkles className="size-3.5" />Big ideas. A little AI magic.</div>
          {user && <p className="mb-4 text-sm text-muted-foreground">{welcomeMessage}</p>}
          <h1 className="max-w-xl font-heading text-5xl leading-[1.06] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-[56px] xl:text-[64px]">Your knowledge.<br />Their next<br /><span className="text-[#d65329]">lightbulb moment.</span></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">Build learning for your LMS, easily. Drag and drop your ideas into engaging courses, with AI to help you write, create, and bring every lesson to life.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {user ? <a href="#workspace" className="inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold hover:bg-brand-hover">Explore your studio <ArrowRight className="size-4" /></a> : <Link to="/sign-up" className="inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold hover:bg-brand-hover">Start your learning journey <ArrowRight className="size-4" /></Link>}
            <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-medium">See how it works <ChevronRight className="size-4" /></a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Check className="size-3.5 text-foreground" />No code. Just creativity.</span><span className="flex items-center gap-1.5"><Check className="size-3.5 text-foreground" />Made for every expert.</span></div>
          {user && <p className="mt-6 text-xs text-muted-foreground">You’re signed in as {user.name} ({user.email}).</p>}
        </div>
        <div className="relative min-w-0">
          <div aria-hidden="true" className="absolute -top-7 -right-3 size-40 rounded-full bg-[#fceb94]/60 blur-2xl" />
          <div className="relative"><CoursePreview /></div>
          <div className="relative mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-2.5 text-xs shadow-sm"><span className="flex size-6 items-center justify-center rounded-full bg-brand-soft"><WandSparkles className="size-3.5" /></span>A little less effort. A lot more possibility.</div>
        </div>
      </section>
      <section id="how-it-works" className="scroll-mt-10 border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_1fr_1fr_1fr] md:px-10">
          <div><p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">From idea to impact</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">Learning creation,<br />minus the complexity.</h2></div>
          {[
            { icon: MousePointer2, title: 'Drag. Drop. Make it yours.', text: 'Arrange lessons, media, and activities into a learning experience that feels like you.' },
            { icon: Sparkles, title: 'An AI co-author by your side.', text: 'Turn what you know into a starting point for content, questions, and clearer explanations.' },
            { icon: Globe2, title: 'Knowledge that goes further.', text: 'Create training for your people, wherever they learn, with your LMS in mind.' },
          ].map(({ icon: Icon, title, text }) => <article key={title}><Icon className="mb-4 size-5 text-[#d65329]" /><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{text}</p></article>)}
        </div>
      </section>
      <section id="possibilities" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-14 md:px-10">
        {/* <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">One idea can change everything</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">What will you teach next?</h2></div><a href="https://www.easygenerator.com/en/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium">Get inspired <ArrowRight className="size-4" /></a></div> */}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            { title: 'A better first day', tag: 'Onboarding', text: 'Help new teammates feel at home, from their very first lesson.', color: 'bg-[#fce2da]', number: '01' },
            { title: 'Confidence, built in', tag: 'Skills & development', text: 'Make space for new skills, fresh perspectives, and everyday growth.', color: 'bg-[#fef5ca]', number: '02' },
            { title: 'Know it. Share it.', tag: 'Product knowledge', text: 'Turn your team’s expertise into knowledge everyone can use.', color: 'bg-[#eaf2ff]', number: '03' },
          ].map((item) => <article key={item.tag} className={`${item.color} rounded-2xl p-6`}><div className="mb-8 flex items-center justify-between"><span className="rounded-full border border-black/10 px-3 py-1 text-[10px] font-medium">{item.tag}</span><span className="text-xs text-black/40">{item.number}</span></div><h3 className="text-xl font-semibold tracking-tight">{item.title}</h3><p className="mt-3 text-sm leading-6 text-black/60">{item.text}</p></article>)}
        </div>
      </section>
    </main>
    <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-black/10 px-5 py-6 text-xs text-muted-foreground md:px-10"><p>Easygenerator · A little knowledge. Endless possibilities.</p><p className="flex items-center gap-1.5"><Plus className="size-3" />Created for curious minds.</p></footer>
  </div>
}
