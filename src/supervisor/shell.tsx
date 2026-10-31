import { ReactNode, createContext, useContext, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Home, Inbox, TrendingUp, OctagonAlert, Flag, Wrench, Users, SlidersHorizontal, ArrowLeft, LogOut, WifiOff, Search } from 'lucide-react'
import { Tooltip, cx, ToastOpts, Avatar } from '../ds/ui'
import { NavApi } from '../ds/nav'
import { fx } from '../ds/fx'
import { spring, springPop, Words } from '../ds/motion'
import { store } from './store'

export type Screen = 'login' | 'home' | 'check' | 'review' | 'closure' | 'forecast' | 'blocked' | 'blockedOne' | 'disputes' | 'disputeOne'
  | 'fixtures' | 'fixtureOne' | 'team' | 'tech' | 'rules' | 'e404' | 'eOffline' | 'e500' | 'expired'
type AppCtx = { nav: NavApi<Screen>; toast: (t: ToastOpts) => void; online: boolean }
export const Ctx = createContext<AppCtx>(null!)
export const useApp = () => useContext(Ctx)

const RAIL: { s: Screen; label: string; icon: typeof Home; key: string }[] = [
  { s: 'home', label: 'Home', icon: Home, key: '1' }, { s: 'check', label: 'To check', icon: Inbox, key: '2' }, { s: 'forecast', label: 'Load forecast', icon: TrendingUp, key: '3' },
  { s: 'blocked', label: 'Blocked', icon: OctagonAlert, key: '4' }, { s: 'disputes', label: 'Disputes', icon: Flag, key: '5' }, { s: 'fixtures', label: 'Repeat fixtures', icon: Wrench, key: '6' },
  { s: 'team', label: 'Team', icon: Users, key: '7' }, { s: 'rules', label: 'Rules', icon: SlidersHorizontal, key: '8' },
]
const GROUP: Partial<Record<Screen, Screen>> = { review: 'check', closure: 'check', blockedOne: 'blocked', disputeOne: 'disputes', fixtureOne: 'fixtures', tech: 'team' }

function Rail() {
  const { nav } = useApp()
  const reps = store.use(s => s.reps)
  const badge: Partial<Record<Screen, number>> = { check: reps.filter(r => r.status === 'new' || r.status === 'closure').length, blocked: reps.filter(r => r.status === 'blocked').length, disputes: reps.filter(r => r.status === 'disputed').length }
  const cur = GROUP[nav.screen] || nav.screen
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return; const r = RAIL.find(x => x.key === e.key); if (r) { fx.select(); nav.reset(r.s, { tr: 'swap' }) } }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  return (
    <nav className="flex w-[88px] shrink-0 flex-col items-center bg-navy py-5" aria-label="Main">
      <Tooltip label="ALIGN · Supervisor desk" side="right"><button onClick={() => { fx.tap(); nav.reset('home', { tr: 'swap' }) }} className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px] bg-sun font-head text-[24px] font-extrabold text-navy"><span className="pt-1">A</span></button></Tooltip>
      <div className="flex flex-col gap-2">
        {RAIL.map(r => {
          const on = cur === r.s; const I = r.icon
          return (
            <Tooltip key={r.s} side="right" label={<span className="flex items-center gap-2">{r.label}<kbd className="rounded-[4px] bg-white/15 px-1.5 font-mono text-[11px]">{r.key}</kbd></span>}>
              <button aria-label={r.label} aria-current={on ? 'page' : undefined} onClick={() => { if (!on) { fx.select(); nav.reset(r.s, { tr: 'swap' }) } }} className="relative flex h-[52px] w-[60px] items-center justify-center rounded-[14px]">
                {on && <motion.span layoutId="rail-on" className="absolute inset-0 rounded-[14px] bg-cream" transition={spring} />}
                <I size={24} strokeWidth={on ? 2.5 : 2} className={cx('relative transition-colors', on ? 'text-navy' : 'text-cream/80 hover:text-cream')} />
                {!!badge[r.s] && <span className={cx('absolute right-0.5 top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-navy px-1 text-[11px] font-bold', r.s === 'check' ? 'bg-sun text-navy' : 'bg-ember text-white')}>{badge[r.s]}</span>}
              </button>
            </Tooltip>
          )
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-3">
        <Tooltip side="right" label="Sign out"><button aria-label="Sign out" onClick={() => { fx.tap(); store.set({ signedIn: false }); nav.reset('login', { tr: 'swap' }) }} className="flex h-10 w-10 items-center justify-center rounded-[12px] text-cream/80 hover:bg-white/10 hover:text-cream"><LogOut size={20} /></button></Tooltip>
        <Tooltip side="right" label="Meera Joshi · Himalaya Bhawan"><span><Avatar name="Meera Joshi" size={44} tone="sky" /></span></Tooltip>
      </div>
    </nav>
  )
}

/** Desktop page: rail on the left, a header, and content that cascades in. */
export function Page({ title, sub, right, children, back, wide }: { title: string; sub?: ReactNode; right?: ReactNode; children: ReactNode; back?: boolean; wide?: boolean }) {
  const { nav, online } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, 0) }, [nav.key])
  return (
    <div className="flex h-full bg-cream">
      <Rail />
      <main className="flex min-w-0 flex-1 flex-col">
        {!online && <div className="flex items-center justify-center gap-2 bg-sun py-2 text-[14px] font-semibold"><WifiOff size={16} />No connection. Changes wait here and send when you are back online.</div>}
        <div ref={ref} className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className={cx('mx-auto px-12 pb-16 pt-9', wide ? 'max-w-[1320px]' : 'max-w-[1180px]')}>
            <header className="mb-7 flex items-end justify-between gap-6">
              <div className="min-w-0">
                {back && <button onClick={() => { fx.tap(); nav.back({ tr: 'swap' }) }} className="mb-2 flex items-center gap-1.5 rounded-[8px] text-[14px] font-semibold text-mid hover:text-navy"><ArrowLeft size={16} />Back</button>}
                <Words text={title} className="font-head text-[36px] font-extrabold leading-tight tracking-[-0.01em]" />
                {sub && <motion.p initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mt-1 max-w-[720px] text-[16px] text-mid">{sub}</motion.p>}
              </div>
              {right && <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...springPop, delay: 0.1 }} className="shrink-0">{right}</motion.div>}
            </header>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export const H2 = ({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) => (
  <div className={cx('mb-3 flex items-center justify-between border-b-2 border-navy pb-2', className)}><h2 className="font-head text-[19px] font-extrabold">{children}</h2>{right}</div>
)
export const Dot = ({ tone = 'navy', size = 12 }: { tone?: 'navy' | 'ember' | 'ring' | 'green' | 'sun' | 'faint'; size?: number }) => (
  <span className={cx('inline-block shrink-0 rounded-full', { navy: 'bg-navy', ember: 'bg-ember', ring: 'border-2 border-ember bg-paper', green: 'bg-green', sun: 'bg-sun ring-2 ring-navy', faint: 'bg-navy/15' }[tone])} style={{ width: size, height: size }} />
)
export function SearchBox({ value, onChange, placeholder = 'Search room or problem' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const r = useRef<HTMLInputElement>(null)
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement !== r.current) { e.preventDefault(); r.current?.focus() } }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return (
    <label className="flex h-11 w-[280px] items-center gap-2 rounded-[12px] border-2 border-line bg-paper px-3 focus-within:border-navy">
      <Search size={18} className="text-mid" /><input ref={r} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" /><kbd className="rounded-[6px] bg-sand px-1.5 font-mono text-[12px] text-mid">/</kbd>
    </label>
  )
}
