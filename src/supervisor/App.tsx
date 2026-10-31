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

function Rail({ sel, go, signOut }: { sel: number; go: (s: Screen) => void; signOut: () => void }) {
  const reduce = useReducedMotion()
  const set = RAILSETS[Math.max(0, sel)]
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 88, height: 900, background: '#00224E', zIndex: 10 }}>
      <button type="button" aria-label="ALIGN desk" title="Desk" onClick={() => go('desk')} className="fig-press"
        style={{ position: 'absolute', left: 22, top: 20, width: 44, height: 44, borderRadius: 22, background: '#FFFBF3', border: 0, cursor: 'pointer', fontFamily: 'Kodchasan, sans-serif', fontWeight: 700, fontSize: 28, lineHeight: '36px', color: '#00224E', padding: 0 }}>A</button>
      {sel >= 0 && <motion.div initial={false} animate={{ top: 98 + 68 * sel }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }}
        style={{ position: 'absolute', left: 12, width: 64, height: 50, borderRadius: 14, background: '#FFFBF3' }} />}
      {set.map((art, i) => (
        <button key={i} type="button" aria-label={LABELS[i]} title={LABELS[i]} aria-current={i === sel ? 'page' : undefined}
          onClick={() => { if (i !== sel) { fx.select(); go(SECTION[i]) } }}
          style={{ position: 'absolute', left: 12, top: 98 + 68 * i, width: 64, height: 50, borderRadius: 14, background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}>
          <img src={figArt(art)} alt="" width={30} height={30} draggable={false} style={{ position: 'absolute', left: 15, top: 10 }} />
        </button>
      ))}
      <button type="button" aria-label="Meera · sign out" title="Meera · sign out" onClick={signOut} className="fig-press"
        style={{ position: 'absolute', left: 20, top: 836, width: 46, height: 46, border: 0, background: 'none', padding: 0, cursor: 'pointer' }}>
        <img src={figArt('232:585')} alt="" width={46} height={46} draggable={false} />
        <span style={{ position: 'absolute', left: 14, top: 9, fontFamily: '"League Spartan", sans-serif', fontWeight: 800, fontSize: 18, lineHeight: '17px', color: '#00224E' }}>M</span>
      </button>
    </div>
  )
}

function Dialog({ m, close, nav }: { m: NonNullable<Modal>; close: () => void; nav: ReturnType<typeof useNav<Screen>> }) {
  const [who, setWho] = useState(m.kind === 'reassign' ? 2 : 0)
  const [note, setNote] = useState('')
  const binds = m.kind === 'merge' ? mergeBinds(close, nav, m.rowId)
    : m.kind === 'escalate' ? escalateBinds(close, m.i || 0, who, setWho, note, setNote)
    : reassignBinds(close, m, who, setWho, nav)
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

function useFit() {
  const [k, setK] = useState(1)
  useEffect(() => { const f = () => setK(Math.min(innerWidth / 1440, innerHeight / 900)); f(); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [])
  return k
}

export default function App() {
  const q = new URLSearchParams(location.search).get('s') as Screen | null
  const nav = useNav<Screen>(q && SCREENS[q] ? q : store.get().signedIn ? 'desk' : 'signin', 'none')
  const [modal, setModal] = useState<Modal>(null)
  const [panel, setPanel] = useState(false)
  const muted = useMuted()
  const k = useFit()
  useEffect(() => { setModal(null) }, [nav.key])
  useEffect(() => {
    const off = () => nav.go('offline', { tr: 'none' })
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setModal(null); setPanel(false) } }
    addEventListener('offline', off); addEventListener('keydown', esc)
    return () => { removeEventListener('offline', off); removeEventListener('keydown', esc) }
  }, [])
  const sel = RAIL_OF[nav.screen]
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
    <Ctx.Provider value={{ nav, setModal: (m: Modal) => { if (m) fx.pop(); setModal(m) } }}>
      <div style={{ position: 'fixed', inset: 0, background: '#E9E1CF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: 1440 * k, height: 900 * k, flexShrink: 0 }}>
          <div style={{ width: 1440, height: 900, transform: `scale(${k})`, transformOrigin: '0 0', position: 'relative', overflow: 'hidden', borderRadius: 28, background: '#FFFBF3' }}>
            <Stage nav={nav as never}><El /></Stage>
            {sel >= 0 && <Rail sel={sel} go={go} signOut={() => { fx.tap(); store.set({ signedIn: false }); go('signin') }} />}
            {modal && <Dialog key={modal.kind} m={modal} close={() => { fx.tap(); setModal(null) }} nav={nav} />}
          </div>
        </div>
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
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
