import { ReactNode, createContext, useContext, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Home, Inbox, TrendingUp, OctagonAlert, Flag, Pencil, Users, SlidersHorizontal, ArrowLeft, LogOut, WifiOff, Search } from '../ds/icons'
import { Tooltip, cx, ToastOpts, Avatar } from '../ds/ui'
import { WobbleDot } from '../ds/icons'
import { NavApi } from '../ds/nav'
import { fx } from '../ds/fx'
import { store } from './store'

export type Screen = 'login' | 'home' | 'check' | 'review' | 'closure' | 'forecast' | 'blocked' | 'blockedOne' | 'disputes' | 'disputeOne'
  | 'fixtures' | 'fixtureOne' | 'team' | 'tech' | 'rules' | 'e404' | 'eOffline' | 'e500' | 'expired'
type AppCtx = { nav: NavApi<Screen>; toast: (t: ToastOpts) => void; online: boolean }
export const Ctx = createContext<AppCtx>(null!)
export const useApp = () => useContext(Ctx)

const RAIL: { s: Screen; label: string; icon: typeof Home; key: string }[] = [
  { s: 'home', label: 'Home', icon: Home, key: '1' }, { s: 'check', label: 'To check', icon: Inbox, key: '2' }, { s: 'forecast', label: 'Load forecast', icon: TrendingUp, key: '3' },
  { s: 'blocked', label: 'Blocked', icon: OctagonAlert, key: '4' }, { s: 'disputes', label: 'Disputes', icon: Flag, key: '5' }, { s: 'fixtures', label: 'Repeat fixtures', icon: Pencil, key: '6' },
  { s: 'team', label: 'Team', icon: Users, key: '7' }, { s: 'rules', label: 'Rules', icon: SlidersHorizontal, key: '8' },
]
const GROUP: Partial<Record<Screen, Screen>> = { review: 'check', closure: 'check', blockedOne: 'blocked', disputeOne: 'disputes', fixtureOne: 'fixtures', tech: 'team' }

const SHORT: Partial<Record<Screen, string>> = { home: 'Home', check: 'To check', forecast: 'Forecast', blocked: 'Blocked', disputes: 'Disputes', fixtures: 'Fixtures', team: 'Team', rules: 'Rules' }

/** Left navigation. Lives outside the page transition so it never moves. */
export function Rail() {
  const { nav } = useApp()
  const reps = store.use(s => s.reps)
  const badge: Partial<Record<Screen, number>> = { check: reps.filter(r => r.status === 'new' || r.status === 'closure').length, blocked: reps.filter(r => r.status === 'blocked').length, disputes: reps.filter(r => r.status === 'disputed').length }
  const cur = GROUP[nav.screen] || nav.screen
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return; const r = RAIL.find(x => x.key === e.key); if (r) { fx.select(); nav.reset(r.s, { tr: 'swap' }) } }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  return (
    <nav className="flex w-[84px] shrink-0 flex-col items-center bg-navy pb-4 pt-5" aria-label="Main">
      <Tooltip label="ALIGN · Supervisor desk" side="right"><button onClick={() => { fx.tap(); nav.reset('home', { tr: 'swap' }) }} className="mb-5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-sun font-head text-[20px] font-bold text-navy"><span className="pt-[3px]">A</span></button></Tooltip>
      <div className="flex w-full flex-col gap-0.5 px-2">
        {RAIL.map(r => {
          const on = cur === r.s; const I = r.icon
          return (
            <Tooltip key={r.s} side="right" className="w-full" label={<span className="flex items-center gap-2">{r.label}<kbd className="rounded-[4px] bg-white/15 px-1.5 font-mono text-[11px]">{r.key}</kbd></span>}>
              <button aria-label={r.label} aria-current={on ? 'page' : undefined} onClick={() => { if (!on) { fx.select(); nav.reset(r.s, { tr: 'swap' }) } }}
                className={cx('relative flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-[10px] transition-colors', on ? 'bg-white/[0.09] text-cream' : 'text-cream/60 hover:bg-white/[0.05] hover:text-cream')}>
                {on && <motion.span layoutId="rail-on" className="absolute -left-2 top-3 bottom-3 w-[3px] rounded-r-full bg-sun" transition={{ type: 'spring', stiffness: 600, damping: 45 }} />}
                <I size={22} strokeWidth={on ? 2.4 : 2} />
                <span className="text-[10.5px] font-medium leading-none tracking-[0.01em]">{SHORT[r.s]}</span>
                {!!badge[r.s] && <span className={cx('absolute right-2 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular', r.s === 'check' ? 'bg-sun text-navy' : 'bg-brick text-white')}>{badge[r.s]}</span>}
              </button>
            </Tooltip>
          )
        })}
      </div>
      <div className="mt-auto flex flex-col items-center gap-2">
        <Tooltip side="right" label="Sign out"><button aria-label="Sign out" onClick={() => { fx.tap(); store.set({ signedIn: false }); nav.reset('login', { tr: 'swap' }) }} className="flex h-9 w-9 items-center justify-center rounded-[8px] text-cream/60 hover:bg-white/10 hover:text-cream"><LogOut size={19} /></button></Tooltip>
        <Tooltip side="right" label="Meera Joshi · Himalaya Bhawan"><span><Avatar name="Meera Joshi" size={36} tone="sun" /></span></Tooltip>
      </div>
    </nav>
  )
}

/** Desktop page: header and content. The rail is drawn once by App, outside the transition. */
export const NO_RAIL: Screen[] = ['login', 'e404', 'eOffline', 'e500', 'expired']
const CRUMB: Partial<Record<Screen, string>> = { review: 'To check', closure: 'To check', blockedOne: 'Blocked', disputeOne: 'Disputes', fixtureOne: 'Repeat fixtures', tech: 'Team', rules: 'Team' }
export function Page({ title, sub, right, children, back, wide }: { title: string; sub?: ReactNode; right?: ReactNode; children: ReactNode; back?: boolean; wide?: boolean }) {
  const { nav, online } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.scrollTo(0, 0) }, [nav.key])
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div className="flex h-full bg-cream">
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-rule bg-cream px-10 text-[13px] text-mid">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-navy">Himalaya Bhawan</span><span className="text-faint">/</span>
            {back ? <button onClick={() => { fx.tap(); nav.back({ tr: 'swap' }) }} className="flex items-center gap-1 hover:text-navy"><ArrowLeft size={14} />{CRUMB[nav.screen] || 'Back'}</button> : <span>Supervisor desk</span>}
          </span>
          <span className="flex items-center gap-4">{!online && <span className="flex items-center gap-1.5 font-semibold text-brick"><WifiOff size={15} />Offline, changes will send later</span>}<span>{today}</span></span>
        </div>
        <div ref={ref} className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className={cx('mx-auto px-10 pb-16 pt-8', wide ? 'max-w-[1320px]' : 'max-w-[1200px]')}>
            <header className="mb-7 flex items-end justify-between gap-6">
              <div className="min-w-0">
                <h1 className="font-head text-[30px] font-bold leading-tight tracking-[-0.01em]">{title}</h1>
                {sub && <p className="mt-1 max-w-[720px] text-[15px] text-mid">{sub}</p>}
              </div>
              {right && <div className="shrink-0">{right}</div>}
            </header>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export const H2 = ({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) => (
  <div className={cx('mb-3 flex items-center justify-between border-b border-line pb-2.5', className)}><h2 className="text-[15px] font-semibold text-navy">{children}</h2>{right}</div>
)
/** Hand-drawn dot from the Figma charts. */
export const Dot = ({ tone = 'navy', size = 12 }: { tone?: 'navy' | 'brick' | 'ring' | 'green' | 'sun' | 'faint'; size?: number }) =>
  tone === 'green' ? <span className="inline-block shrink-0 rounded-full bg-green" style={{ width: size, height: size }} /> : <WobbleDot kind={tone} size={Math.round(size * 1.35)} />
export function SearchBox({ value, onChange, placeholder = 'Search room or problem' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const r = useRef<HTMLInputElement>(null)
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement !== r.current) { e.preventDefault(); r.current?.focus() } }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  return (
    <label className="flex h-10 w-[280px] items-center gap-2 rounded-[9px] border border-line bg-paper px-3 focus-within:border-canal focus-within:shadow-[0_0_0_3px_rgba(23,96,107,.15)]">
      <Search size={18} className="text-mid" /><input ref={r} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none" /><kbd className="rounded-[5px] border border-line px-1.5 font-mono text-[11px] text-mid">/</kbd>
    </label>
  )
}
