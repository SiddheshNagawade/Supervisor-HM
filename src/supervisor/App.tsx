/* Supervisor desk app. The 1440 x 900 Figma frame, scaled to fit the window.
   The navy rail is drawn once, outside the page, so it never moves between sections;
   only its cream "selected" tile glides to the new section. Dialogs sit above everything,
   dimming the rail too, exactly as the Figma dialogs do. */
import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNav, Stage } from '../ds/nav'
import { Fig, figArt, FNode } from '../fig/Fig'
import { fx, setMuted, useMuted } from '../ds/fx'
import { Ctx, Modal, Screen, SCREENS, RAIL_OF, RAILSETS, S, mergeBinds, escalateBinds, reassignBinds } from './screens'
import FIG from './fig.json'
import { store, NEW_ROW } from './store'
import { PeekHost, OfflineBuddy } from '../fig/mascot'
import { ToolOverlay } from '../fig/extras'
import { useViewport, useKeepFocusVisible, VP } from '../ds/viewport'
import { useAssets, prefetchBundles, fileUrl } from '../fig/preload'
import { preloadMascot } from '../fig/mascot'

// once the first screen is up, quietly fetch every other screen's packed drawings (one request each), so later screens appear whole at once
const BACKGROUND = ['build-1', 'build-2', 'build-3', 'build-log', 'tool-driver', 'tool-flame']
function warmEverything() { prefetchBundles(Object.values(S).map(f => f.i), BACKGROUND.map(fileUrl)); setTimeout(() => preloadMascot(), 1500) }

const RAW = (FIG as unknown as { screens: Record<string, FNode> }).screens
const from = (s: FNode, firstId: string, skip: string[] = []): FNode => {
  const k = s.k || []; const i = k.findIndex(n => n.i === firstId)
  return { ...s, f: undefined, k: k.slice(i).filter(n => !skip.includes(n.i)) }
}
// dialog layers: everything from the scrim up, taken from the dialog frames
const MODAL_FRAMES: Record<string, FNode> = {}
function modalFrame(kind: string) {
  if (!MODAL_FRAMES[kind]) {
    const src: Record<string, [string, string, string[]]> = { merge: ['232:1083', '232:1183', ['232:1208']], escalate: ['234:303', '234:377', []], reassign: ['234:394', '234:469', []] }
    const [, first, skip] = src[kind]
    const frame = (FIG as unknown as { screens: Record<string, FNode> }).screens[kind === 'merge' ? 'merge' : kind]
    MODAL_FRAMES[kind] = from(frame, first, skip)
  }
  return MODAL_FRAMES[kind]
}
const LABELS = ['Desk', 'To check', 'Load forecast', 'Blocked', 'Disputes', 'Fixtures', 'Team']
const SECTION: Screen[] = ['desk', 'check', 'forecast', 'blocked', 'disputes', 'fixtures', 'team']

const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL
const RAIL_ICONS = ['desk', 'check', 'forecast', 'blocked', 'disputes', 'fixtures', 'team'].map(n => `${BASE}fig/ico-rail-${n}.svg`)
const RAIL_OPEN = 240, RAIL_SHUT = 88
/** The "sidebar" glyph: a rounded panel with a divider and an arrow that points the way it will move. */
const PanelGlyph = ({ open }: { open: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <rect x="2.5" y="4.5" width="21" height="17" rx="5" stroke="#FFFBF3" strokeWidth="2.2" />
    <path d="M9.5 4.8V21.2" stroke="#FFFBF3" strokeWidth="2.2" strokeLinecap="round" />
    <path d={open ? 'M16.5 10.5L13.5 13L16.5 15.5' : 'M13.5 10.5L16.5 13L13.5 15.5'} stroke="#FFD265" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Rail({ sel, go, signOut, open, setOpen, H }: { sel: number; go: (s: Screen) => void; signOut: () => void; open: boolean; setOpen: (v: boolean) => void; H: number }) {
  const reduce = useReducedMotion()
  const [hov, setHov] = useState(false)
  const RW = open ? RAIL_OPEN : RAIL_SHUT
  const sp = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 40 }
  const label = { fontFamily: '"League Spartan", sans-serif', fontWeight: 700, fontSize: 17, lineHeight: '20px', whiteSpace: 'nowrap' as const }
  return (
    <motion.div initial={false} animate={{ width: RW }} transition={sp} style={{ position: 'absolute', left: 0, top: 0, height: H, background: '#00224E', zIndex: 10, overflow: 'hidden' }}>
      {/* the logo; point at it and it becomes the sidebar toggle */}
      <button type="button" aria-label={open ? 'Close sidebar' : 'Open sidebar'} title={open ? 'Close sidebar' : 'Open sidebar'} aria-expanded={open}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onFocus={() => setHov(true)} onBlur={() => setHov(false)}
        onClick={() => { fx.tap(); setOpen(!open) }} className="fig-press"
        style={{ position: 'absolute', left: open ? 18 : 22, top: 20, width: 44, height: 44, borderRadius: open ? 12 : 22, background: hov || open ? 'rgba(255,251,243,.12)' : '#FFFBF3', border: 0, cursor: 'pointer', fontFamily: 'Kodchasan, sans-serif', fontWeight: 700, fontSize: 28, lineHeight: '36px', color: '#00224E', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, border-radius .2s' }}>
        {hov || open ? <PanelGlyph open={open} /> : 'A'}
      </button>
      <span style={{ position: 'absolute', left: 74, top: 30, ...label, fontWeight: 800, fontSize: 24, lineHeight: '24px', color: '#FFFBF3', opacity: open ? 1 : 0, transition: 'opacity .2s', pointerEvents: 'none' }}>Align</span>
      {sel >= 0 && <motion.div initial={false} animate={{ top: 98 + 68 * sel, width: RW - 24 }} transition={sp}
        style={{ position: 'absolute', left: 12, height: 50, borderRadius: 14, background: '#FFFBF3' }} />}
      {RAIL_ICONS.map((src, i) => (
        <button key={i} type="button" aria-label={LABELS[i]} title={open ? undefined : LABELS[i]} aria-current={i === sel ? 'page' : undefined}
          onClick={() => { if (i !== sel) { fx.select(); go(SECTION[i]) } }}
          style={{ position: 'absolute', left: 12, top: 98 + 68 * i, width: RW - 24, height: 50, borderRadius: 14, background: 'transparent', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}>
          <img src={src} alt="" width={36} height={36} draggable={false} style={{ position: 'absolute', left: 14, top: 7, objectFit: 'contain' }} />
          <span style={{ position: 'absolute', left: 62, top: 15, ...label, color: i === sel ? '#00224E' : '#FFFBF3', opacity: open ? 1 : 0, transition: 'opacity .2s' }}>{LABELS[i]}</span>
        </button>
      ))}
      <button type="button" aria-label="Meera · sign out" title="Meera · sign out" onClick={signOut} className="fig-press"
        style={{ position: 'absolute', left: 20, top: H - 64, width: RW - 40, height: 46, border: 0, background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <img src={figArt('232:585')} alt="" width={46} height={46} draggable={false} />
        <span style={{ position: 'absolute', left: 14, top: 9, fontFamily: '"League Spartan", sans-serif', fontWeight: 800, fontSize: 18, lineHeight: '17px', color: '#00224E' }}>M</span>
        <span style={{ position: 'absolute', left: 58, top: 4, ...label, color: '#FFFBF3', opacity: open ? 1 : 0, transition: 'opacity .2s' }}>Meera</span>
        <span style={{ position: 'absolute', left: 58, top: 24, fontFamily: '"M PLUS Rounded 1c", sans-serif', fontSize: 12.5, lineHeight: '16px', color: '#BDDDFF', opacity: open ? 1 : 0, transition: 'opacity .2s', whiteSpace: 'nowrap' }}>Sign out</span>
      </button>
    </motion.div>
  )
}
function Dialog({ m, close, nav }: { m: NonNullable<Modal>; close: () => void; nav: ReturnType<typeof useNav<Screen>> }) {
  const [who, setWho] = useState(m.kind === 'reassign' ? 2 : 0)
  const [note, setNote] = useState('')
  const { busy } = React.useContext(Ctx)
  const binds = m.kind === 'merge' ? mergeBinds(close, nav, m.rowId, busy)
    : m.kind === 'escalate' ? escalateBinds(close, m.i || 0, who, setWho, note, setNote, busy)
    : reassignBinds(close, m, who, setWho, nav, busy)
  const f = modalFrame(m.kind)
  // the dialog card and its contents rise in once; the scrim fades
  const scrim = f.k![0].i
  const withMotion = { ...binds }
  for (const n of f.k!) if (n.i !== scrim) withMotion[n.i] = { ...withMotion[n.i], style: { animation: 'figmodal .24s cubic-bezier(.22,1,.36,1) both', ...withMotion[n.i]?.style } }
  return <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}><Fig s={f} binds={withMotion} bg="transparent" /></div>
}

const GROUPS: [string, [Screen, string][]][] = [
  ['Getting in', [['signin', 'Sign in'], ['expired', 'Session expired']]],
  ['Desk and checking', [['desk', 'Desk'], ['check', 'To check'], ['review', 'Review report'], ['closure', 'Closure review']]],
  ['Problems', [['forecast', 'Load forecast'], ['blocked', 'Blocked'], ['blockedOne', 'Blocked job'], ['disputes', 'Disputes'], ['disputeOne', 'Dispute']]],
  ['Fixtures and team', [['fixtures', 'Fixtures'], ['fixtureOne', 'Fixture history'], ['team', 'Team'], ['tech', 'Technician'], ['rules', 'Rules']]],
  ['Errors', [['e404', 'Page not found'], ['offline', 'No internet'], ['e500', 'Server error']]],
]

/** Scale the desk to the window (never cropped). On a wide or tall window the page fills the extra room instead of leaving bars;
    on a phone or a tablet held upright the desk keeps a readable size and you scroll sideways. */
function useFit(needW: number, vp: VP) {
  // with the keyboard up the desk keeps its width fit (and scrolls) instead of being squashed into the strip the keyboard leaves
  const fit = vp.kb ? vp.w / needW : Math.min(vp.w / needW, vp.h / 900)
  const k = Math.max(fit, Math.min(0.62, vp.h / 900))
  return { k, W: Math.max(needW, Math.ceil(vp.w / k)), H: Math.max(900, Math.ceil(vp.h / k)) }
}
const scrimCss = (c?: string) => { if (!c || !c.startsWith('#')) return 'rgba(0,34,78,.5)'; const [h, al] = c.split('@'); const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al ?? 1})` }
export default function App() {
  const q = new URLSearchParams(location.search).get('s') as Screen | null
  const nav = useNav<Screen>(q && SCREENS[q] ? q : store.get().signedIn ? 'desk' : 'signin', 'none')
  const [modal, setModal] = useState<Modal>(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [panel, setPanel] = useState(false)
  const [job, setJob] = useState<{ fn: () => void } | null>(null) // an action waiting for the screwdriver rocket to cross the screen
  const muted = useMuted()
  const [open, setOpenState] = useState(() => { try { return localStorage.getItem('align.sup.rail') === '1' } catch { return false } })
  const setOpen = (v: boolean) => { setOpenState(v); try { localStorage.setItem('align.sup.rail', v ? '1' : '0') } catch { /* no memory in a private window */ } }
  useEffect(() => { setModal(null) }, [nav.key])
  useEffect(() => {
    const off = () => setOnline(false), on = () => setOnline(true)
    addEventListener('online', on)
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModal(null); setPanel(false) } if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); setOpen(!open) } }
    addEventListener('offline', off); addEventListener('keydown', esc)
    return () => { removeEventListener('offline', off); removeEventListener('online', on); removeEventListener('keydown', esc) }
  }, [open])
  const sel = RAIL_OF[nav.screen]
  const extra = sel >= 0 && open ? RAIL_OPEN - RAIL_SHUT : 0
  const vp = useViewport(); useKeepFocusVisible()
  useEffect(() => { warmEverything() }, [])
  const { k, W, H } = useFit(1440 + extra, vp)
  const railReady = useAssets(RAIL_ICONS) // the sidebar appears with its pictures, never before them
  const frameLeft = extra + Math.max(0, (W - 1440 - extra) / 2) // the desk sits in the room left over, next to the rail
  const go = (s: Screen) => nav.reset(s, { tr: 'none' })
  const El = SCREENS[nav.screen]
  const sim: [string, () => void][] = [
    ['A student reports a new problem', () => { const r = store.get().rows; if (r.length < 6 && !r.some(x => x.id === NEW_ROW.id)) { store.set({ rows: [...r, NEW_ROW] }); fx.notify() } go('check') }],
    ['Internet drops', () => nav.go('offline', { tr: 'none' })],
    ['A link points nowhere', () => nav.go('e404', { tr: 'none' })],
    ['The server fails', () => nav.go('e500', { tr: 'none' })],
    ['Session times out', () => { store.set({ signedIn: false }); go('expired') }],
  ]
  return (
    <Ctx.Provider value={{ nav, setModal: (m: Modal) => { if (m) fx.pop(); setModal(m) }, busy: (fn: () => void) => { if (!job) setJob({ fn }) } }}>
      <div style={{ position: 'fixed', left: 0, right: 0, top: vp.top, height: vp.h, background: '#FFFBF3', overflow: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ width: W * k, height: H * k }}>
          <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0', transition: 'transform .3s cubic-bezier(.22,1,.36,1)', position: 'relative', overflow: 'hidden', background: '#FFFBF3' }}>
            <div style={{ position: 'absolute', left: frameLeft, top: 0, width: 1440, height: 900, overflow: 'hidden', transition: 'left .3s cubic-bezier(.22,1,.36,1)' }}>
              <Stage nav={nav as never}><El /></Stage>
              {modal && <Dialog key={modal.kind} m={modal} close={() => { fx.tap(); setModal(null) }} nav={nav} />}
            </div>
            {sel >= 0 && railReady && <Rail sel={sel} go={go} open={open} setOpen={setOpen} H={H} signOut={() => { fx.tap(); store.set({ signedIn: false }); go('signin') }} />}
            {modal && (() => { const c = scrimCss(modalFrame(modal.kind).k![0].f); return <>
              <div style={{ position: 'absolute', left: 0, top: 0, width: frameLeft, height: H, background: c, zIndex: 21, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: frameLeft + 1440, top: 0, width: Math.max(0, W - frameLeft - 1440), height: H, background: c, zIndex: 21, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: frameLeft, top: 900, width: 1440, height: Math.max(0, H - 900), background: c, zIndex: 21, pointerEvents: 'none' }} />
            </> })()}
            <OfflineBuddy offline={!online} cx={frameLeft + 764} scale={1.2} title="You're offline." sub="Reconnect to get the latest updates. What you loaded is still here." back={{ mood: 'wave', say: 'Back online!', side: 'right' }} />
            <PeekHost w={W} h={H} size={340} side="right" />
            {job && <ToolOverlay kind="rocket" bg="rgba(255,251,243,.9)" ms={1300} label="Working on it" onDone={() => { const f = job.fn; setJob(null); f() }} />}
          </div>
        </div>        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {panel && (
            <div className="scroll-thin" style={{ width: 300, maxHeight: 'calc(100vh - 90px)', overflowY: 'auto', background: '#FFFBF3', border: '2px solid #00224E', borderRadius: 16, boxShadow: '0 4px 0 #00224E', padding: 16, fontFamily: '"M PLUS Rounded 1c", sans-serif', color: '#00224E' }}>
              <div style={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, fontSize: 18 }}>Try the desk</div>
              <div style={{ fontSize: 13, color: '#3E4F72', marginTop: 4 }}>Things students and technicians would do.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {sim.map(([l, f]) => <button key={l} onClick={() => { fx.tap(); setPanel(false); f() }} style={{ textAlign: 'left', border: '1.5px solid #00224E', borderRadius: 10, background: '#FFFFFF', padding: '7px 10px', fontSize: 14, cursor: 'pointer', color: '#00224E' }}>{l}</button>)}
              </div>
              {GROUPS.map(([t, items]) => (
                <div key={t} style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 700, fontSize: 13, color: '#3E4F72' }}>{t}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {items.map(([s, l]) => <button key={s} onClick={() => { fx.tap(); if (s !== 'signin' && s !== 'expired') store.set({ signedIn: true }); go(s) }}
                      style={{ border: '1.5px solid #00224E', borderRadius: 999, background: nav.screen === s ? '#FFD265' : '#FFFBF3', padding: '3px 10px', fontSize: 13, cursor: 'pointer', color: '#00224E' }}>{l}</button>)}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => setMuted(!muted)} style={{ border: '1.5px solid #00224E', borderRadius: 10, background: '#FFFBF3', padding: '5px 10px', fontSize: 13, cursor: 'pointer', color: '#00224E' }}>{muted ? 'Sound off' : 'Sound on'}</button>
                <button onClick={() => { store.reset(); setPanel(false); go('signin') }} style={{ border: '1.5px solid #00224E', borderRadius: 10, background: '#FFFBF3', padding: '5px 10px', fontSize: 13, cursor: 'pointer', color: '#00224E' }}>Restart</button>
              </div>
            </div>
          )}
          <button aria-label="Try the desk" title="Try the desk: screens and events" onClick={() => { fx.tap(); setPanel(p => !p) }}
            style={{ height: 44, padding: '0 16px', borderRadius: 22, border: '2px solid #00224E', background: panel ? '#00224E' : '#FFD265', color: panel ? '#FFFBF3' : '#00224E', boxShadow: '0 3px 0 #00224E', fontFamily: '"League Spartan", sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            {panel ? 'Close' : 'Try it'}
          </button>
        </div>
      </div>
    </Ctx.Provider>
  )
}
export { React, S, RAW }
