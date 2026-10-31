/* Supervisor desk screens. Every screen is the Figma frame itself (ALIGN v3, Supervisor sections),
   drawn by the Figma renderer. This file only attaches behaviour to the Figma layers by node id,
   and plays each drawing's own one-time animation when the screen opens. */
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Fig, FNode, Binds, textStyle } from '../fig/Fig'
import { Reveal, Slap, PlaceDown, Settle } from '../fig/anim'
import { NavApi } from '../ds/nav'
import { fx } from '../ds/fx'
import FIG from './fig.json'
import { store, EMAIL_OK, NEW_ROW, CLOSURES, BLOCKED, DISPUTES, FIXTURES, TEAM, Row } from './store'

export const S = (FIG as unknown as { screens: Record<string, FNode> }).screens
export const RAILSETS = (FIG as unknown as { rail: string[][] }).rail

export type Screen = 'signin' | 'desk' | 'check' | 'review' | 'closure' | 'forecast' | 'blocked' | 'blockedOne' | 'disputes' | 'disputeOne'
  | 'fixtures' | 'fixtureOne' | 'team' | 'tech' | 'rules' | 'e404' | 'offline' | 'e500' | 'expired'
export type Modal = { kind: 'merge' | 'escalate' | 'reassign'; i?: number; from?: 'blocked' | 'dispute'; rowId?: string } | null
type AppCtx = { nav: NavApi<Screen>; setModal: (m: Modal) => void }
export const Ctx = createContext<AppCtx>(null!)
const useApp = () => useContext(Ctx)
const P = <T,>(nav: NavApi<Screen>, k: string, d: T) => (nav.params[k] as T) ?? d

/* ---------- small helpers to bind Figma layers ---------- */
const B = (...parts: Binds[]): Binds => Object.assign({}, ...parts)
const id = (n: string | number) => (String(n).includes(':') ? String(n) : '232:' + n)
/** A Figma button is a rectangle with a text on top. The rectangle takes the click. */
const btn = (rect: string | number, fn: () => void, label?: string): Binds => ({ [id(rect)]: { onClick: () => { fx.tap(); fn() }, label } })
const txt = (n: string | number, text: ReactNode, style?: React.CSSProperties): Binds => ({ [id(n)]: { text, style } })
const hide = (...ns: (string | number)[]): Binds => Object.fromEntries(ns.map(n => [id(n), { hide: true }]))
const wrapAll = (ns: FNode[], fn: (n: FNode, i: number) => (el: ReactNode) => ReactNode): Binds => Object.fromEntries(ns.map((n, i) => [n.i, { wrap: (el: ReactNode) => fn(n, i)(el) }]))
const arts = (s: FNode, pred: (n: FNode) => boolean) => (s.k || []).filter(n => n.art && pred(n))

/* ---------- one-time motions for the drawings ---------- */
function Drop({ children, delay }: { children: ReactNode; delay: number }) {
  const r = useReducedMotion()
  return <motion.div initial={r ? false : { y: -26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 19, delay }}>{children}</motion.div>
}
function Pop({ children, delay, sound }: { children: ReactNode; delay: number; sound?: () => void }) {
  const r = useReducedMotion()
  useEffect(() => { if (!sound || r) return; const t = setTimeout(sound, delay * 1000 + 80); return () => clearTimeout(t) }, [])
  return <motion.div initial={r ? false : { scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 17, delay }}>{children}</motion.div>
}
const drop = (d: number) => (el: ReactNode) => <Drop delay={d}>{el}</Drop>
const pop = (d: number, sound?: () => void) => (el: ReactNode) => <Pop delay={d} sound={sound}>{el}</Pop>
const rev = (dir: 'x' | 'y', d: number, dur = 0.9) => (el: ReactNode) => <Reveal dir={dir} delay={d} dur={dur}>{el}</Reveal>
const slap = (d: number) => (el: ReactNode) => <Slap delay={d}>{el}</Slap>
const place = (d: number) => (el: ReactNode) => <PlaceDown delay={d}>{el}</PlaceDown>
const settle = (d: number) => (el: ReactNode) => <Settle delay={d}>{el}</Settle>
const bar = (d: number): React.CSSProperties => ({ animation: `figbar .55s cubic-bezier(.22,1,.36,1) ${d}s both`, transformOrigin: 'left center' })

/** A Figma text layer turned into a real text field, in the same font and colour. */
const field = (n: string | number, value: string, onChange: (v: string) => void, o: { type?: string; width: number; placeholder?: string; onEnter?: () => void }): Binds => ({
  [id(n)]: {
    style: { width: o.width },
    render: (node: FNode) => (
      <input value={value} type={o.type || 'text'} placeholder={o.placeholder} spellCheck={false} autoComplete={o.type === 'password' ? 'current-password' : 'email'}
        onChange={e => { const v = e.target.value; v.length > value.length ? fx.key(v.length % 9) : fx.erase(); onChange(v) }}
        onKeyDown={e => { if (e.key === 'Enter') o.onEnter?.() }}
        style={{ ...textStyle(node), width: '100%', height: '100%', background: 'transparent', border: 0, outline: 0, padding: 0, pointerEvents: 'auto' }} />
    ),
  },
})

/* ================= Sign in, and Session expired (same layout) ================= */
function SignInLike({ s, ids }: { s: FNode; ids: { email: string; pass: string; r1: string; r2: string; go: string; forgot: string; l1: string; l2: string } }) {
  const { nav } = useApp()
  const saved = store.use(x => x.email)
  const [email, setEmail] = useState(saved || 'meera@design.iitr.ac.in')
  const [pass, setPass] = useState('hostel2026')
  const [err, setErr] = useState<'' | 'email' | 'pass'>('')
  const [forgot, setForgot] = useState(false)
  const submit = () => {
    if (!EMAIL_OK.test(email.trim())) { fx.error(); setErr('email'); return }
    if (!pass) { fx.error(); setErr('pass'); return }
    fx.success(); store.set({ signedIn: true, email: email.trim() }); nav.reset('desk', { tr: 'none' })
  }
  const brick = { color: '#B8530A' }
  const dots = arts(s, n => n.n === 'd' && n.w === 26)
  const cols = [...new Set(dots.map(d => d.x))].sort((a, b) => a - b)
  return <Fig s={s} binds={B(
    field(ids.email, email, v => { setEmail(v); setErr('') }, { width: 436, onEnter: submit }),
    field(ids.pass, pass, v => { setPass(v); setErr('') }, { width: 436, type: 'password', onEnter: submit }),
    err === 'email' ? B(txt(ids.l1, 'Use your institute email, like name@design.iitr.ac.in', brick), { [ids.r1]: { style: { background: '#B8530A' } } }) : {},
    err === 'pass' ? B(txt(ids.l2, 'Type your password', brick), { [ids.r2]: { style: { background: '#B8530A' } } }) : {},
    forgot ? txt(ids.l2, 'Ask the Bhawan office to reset it, then sign in here', brick) : {},
    btn(ids.go, submit, 'Sign in'),
    { [ids.forgot]: { onClick: () => { fx.tap(); setForgot(true) } } },
    // the dot chart fills in once, column by column, each dot falling into place
    wrapAll(dots, n => drop(0.25 + cols.indexOf(n.x) * 0.16 + (626 - n.y) / 34 * 0.05)),
  )} />
}
export const SignIn = () => <SignInLike s={S.signin} ids={{ email: '232:551', pass: '232:554', r1: '232:552', r2: '232:555', go: '232:556', forgot: '232:558', l1: '232:550', l2: '232:553' }} />
export const Expired = () => <SignInLike s={S.expired} ids={{ email: '236:1377', pass: '236:1380', r1: '236:1378', r2: '236:1381', go: '236:1382', forgot: '236:1384', l1: '236:1376', l2: '236:1379' }} />

/* ================= Desk ================= */
const BHAWAN = ['Himalya Bhawan · all blocks  ⌄', 'Himalya Bhawan · Block A  ⌄', 'Himalya Bhawan · Block B  ⌄', 'Himalya Bhawan · Block C  ⌄', 'Himalya Bhawan · Block D  ⌄']
export function Desk() {
  const { nav, setModal } = useApp()
  const b = store.use(x => x.bhawan)
  const s = S.desk
  const chart = arts(s, n => n.n === 'dot' && n.w === 22 && n.y <= 470)
  const cols = [...new Set(chart.map(d => d.x))].sort((a, c) => a - c)
  return <Fig s={s} binds={B(
    txt(589, `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Meera.`),
    btn(591, () => store.set({ bhawan: (b + 1) % BHAWAN.length }), 'Change block'), txt(592, BHAWAN[b]),
    wrapAll(chart, n => drop(0.15 + cols.indexOf(n.x) * 0.12 + (468 - n.y) / 24 * 0.04)),
    { '232:732': { wrap: rev('y', 0.9, 0.7) } },
    { '232:759': { wrap: rev('x', 0.5) }, '232:789': { wrap: rev('x', 0.6) }, '232:813': { wrap: rev('x', 0.7) }, '232:833': { wrap: rev('x', 0.8) } },
    ...['785', '809', '829', '845'].map((g, i) => ({ [id(g)]: { onClick: () => { fx.tap(); nav.reset('check', { tr: 'none' }) }, label: 'Open ' + ['Block C', 'Block A', 'Block D', 'Block B'][i] } })),
    { '232:849': { wrap: pop(0.5) }, '232:860': { wrap: pop(0.6) }, '232:868': { wrap: pop(0.7) } },
    { '232:875': { wrap: rev('x', 1.3, 1.1) } },
    btn(855, () => { nav.go('blockedOne', { tr: 'none', p: { i: 0 } }); setModal({ kind: 'escalate', i: 0 }) }, 'Escalate'),
    btn(857, () => nav.go('blockedOne', { tr: 'none', p: { i: 0 } }), 'Reassign'),
    btn(865, () => nav.go('closure', { tr: 'none' }), 'Review all'),
    btn(873, () => nav.go('disputeOne', { tr: 'none', p: { i: 0 } }), 'Open'),
  )} />
}

/* ================= To check ================= */
const CHECK_SLOTS = [
  [916, 920, 921, 922, 923, 924, 925, 926], [927, 931, 932, 933, 934, 935, 936, 937], [938, 942, 943, 944, 945, 946, 947, 948],
  [949, 952, 953, 954, 955, 956, 957, 958], [959, 962, 963, 964, 965, 966, 967, 968], [969, 973, 974, 975, 976, 977, 978, 0],
]
const DOT = { navy: '232:916', ring: '232:949', brick: '232:969' }
export function Check() {
  const { nav } = useApp()
  const rows = store.use(x => x.rows)
  const at = store.use(x => x.closureAt)
  const binds: Binds[] = [
    txt(911, String(rows.length)), txt(913, String(Math.max(0, CLOSURES.length - at))),
    { '232:912': { onClick: () => { fx.select(); nav.go('closure', { tr: 'none' }) } } },
  ]
  CHECK_SLOTS.forEach((sl, j) => {
    const r = rows[j]
    if (!r) { binds.push(hide(...sl.filter(Boolean)), j > 0 ? hide(CHECK_SLOTS[j - 1][7] || 0) : {}); return }
    binds.push(
      { [id(sl[0])]: { art: DOT[r.dot], wrap: pop(0.15 + j * 0.07) } },
      txt(sl[1], r.room), txt(sl[2], r.title), txt(sl[3], r.sub), txt(sl[4], r.age, { color: r.late ? '#B8530A' : '#3E4F72' }),
      btn(sl[5], () => nav.go('review', { tr: 'none', p: { id: r.id } }), 'Review ' + r.room),
    )
    if (j === rows.length - 1 && sl[7]) binds.push(hide(sl[7]))
  })
  return <Fig s={S.check} binds={B(...binds)} />
}

/* ================= Review report (+ Merge dialog) ================= */
const CHIPS = [['232:1044', 'Ravi'], ['232:1055', 'Imran'], ['232:1070', 'Deepak']]
const done = (rowId: string) => store.set(s => ({ rows: s.rows.filter(r => r.id !== rowId) }))
export function Review() {
  const { nav, setModal } = useApp()
  const rows = store.use(x => x.rows)
  const r: Row = rows.find(x => x.id === P(nav, 'id', 'r1')) || rows[0] || NEW_ROW
  const [who, setWho] = useState(0)
  const finish = () => { fx.stamp(); done(r.id); nav.reset('check', { tr: 'none' }) }
  return <Fig s={S.review} binds={B(
    txt(1011, `${r.room} · Block ${r.block} · sent ${r.age.replace(/^1d ago$/, 'yesterday').replace(/(\d+)h ago/, '$1 hours ago').replace(/(\d+)d ago/, '$1 days ago')}`),
    r.photo ? { '232:1012': { art: r.photo === 'chair' ? '232:2013' : undefined, wrap: place(0.1) } } : hide(1012, 1025),
    r.photo === 'chair' ? { '232:1025': { text: `${r.item}, ${r.room}`, dy: -50 } } : txt(1025, `${r.item}, ${r.room}`),
    r.photo ? { '232:1026': { wrap: slap(0.4) } } : { '232:1026': { wrap: slap(0.25), dy: -344 }, '232:1031': { dy: -344 } },
    txt(1031, r.quote),
    r.dup ? { '232:1034': { wrap: place(0.55) } } : hide(1032, 1033, 1034, 1038, 1039, 1040, 1041, 1042),
    btn(1040, () => setModal({ kind: 'merge', rowId: r.id }), 'Merge'),
    ...CHIPS.map(([c, name], i) => ({ [c]: { onClick: () => { fx.select(); setWho(i) }, label: 'Assign to ' + name, style: { background: who === i ? '#FFD265' : '#FFFBF3' } } })),
    { '232:1046': { wrap: pop(0.7) }, '232:1050': { wrap: pop(0.75) }, '232:1057': { wrap: pop(0.8) }, '232:1061': { wrap: pop(0.85) }, '232:1065': { wrap: pop(0.9) }, '232:1072': { wrap: pop(0.95) } },
    btn(1078, finish, 'Accept and assign'),
    { '232:1080': { onClick: () => { fx.tap(); done(r.id); nav.reset('check', { tr: 'none' }) } } },
  )} />
}
export const mergeBinds = (close: () => void, nav: NavApi<Screen>, rowId?: string): Binds => B(
  { '232:1183': { style: { animation: 'figfade .2s ease both' } } },
  { '232:1193': { wrap: place(0.15) }, '232:1199': { wrap: place(0.3) }, '232:1205': { wrap: rev('x', 0.45, 0.5) } },
  btn(1189, () => { fx.stamp(); if (rowId) done(rowId); close(); nav.reset('check', { tr: 'none' }) }, 'Merge'),
  btn(1191, close, 'Keep separate'),
)

/* ================= Closure review ================= */
const PROG = ['232:1290', '232:1296', '232:1300', '232:1304', '232:1308', '232:1312']
export function Closure() {
  const { nav } = useApp()
  const at = Math.min(store.use(x => x.closureAt), CLOSURES.length - 1)
  const c = CLOSURES[at]
  const next = () => { fx.stamp(); if (at + 1 >= CLOSURES.length) { store.set({ closureAt: CLOSURES.length }); nav.reset('check', { tr: 'none' }) } else store.set({ closureAt: at + 1 }) }
  return <Fig key={at} s={S.closure} binds={B(
    txt(1239, `${c.room} · Block ${c.block} · closed ${c.when} by ${c.tech}`), txt(1269, `What ${c.tech} did`), txt(1271, c.did), txt(1316, `closure ${at + 1} of ${CLOSURES.length}`),
    { '232:1240': { wrap: place(0.1) }, '232:1254': { wrap: place(0.35) } },
    { '232:1272': { wrap: pop(0.7, fx.check) }, '232:1277': { wrap: pop(0.85, fx.check) }, '232:1282': { wrap: pop(1.0, fx.check) } },
    ...PROG.map((p, k) => ({ [p]: { art: k === at ? '232:1290' : k === 0 ? '232:1296' : undefined } })),
    btn(1287, next, 'Accept closure'),
    { '232:1289': { onClick: () => { fx.tap(); next() } } },
  )} />
}

/* ================= Load forecast ================= */
export function Forecast() {
  const moved = store.use(x => x.moved), left = store.use(x => x.leftAlone)
  const s = S.forecast
  const dots = arts(s, n => n.n === 'dot')
  const cols = [...new Set(dots.map(d => d.x))].sort((a, b) => a - b)
  const r = useReducedMotion()
  const settled = moved || left
  return <Fig s={s} binds={B(
    wrapAll(dots, n => (n.i === '232:1518' || n.i === '232:1514')
      ? (el: ReactNode) => <Drop delay={0.15 + cols.indexOf(n.x) * 0.1 + (568 - n.y) / 24 * 0.035}><motion.div animate={{ x: moved ? -158 : 0 }} transition={r ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 18 }}>{el}</motion.div></Drop>
      : drop(0.15 + cols.indexOf(n.x) * 0.1 + (568 - n.y) / 24 * 0.035)),
    { '232:1631': { wrap: rev('x', 1.0, 1.0) }, '232:1635': { wrap: rev('x', 1.5, 0.6) }, '232:1637': { wrap: slap(1.2) } },
    moved ? B(txt(1522, '+2 over', { top: 260 }), txt(1464, '+4 over', { top: 212 }), txt(1634, 'Tuesday is fine now', { color: '#3E4F72' })) : {},
    moved ? txt(1642, 'Done. Two Tuesday jobs now go on Monday, inside their promise.') : left ? txt(1642, 'Okay. Tuesday stays as it is. ALIGN will warn the team on Monday night.') : {},
    btn(1643, () => { fx.success(); store.set({ moved: true }) }, 'Move two to Monday'),
    { '232:1645': { onClick: () => { fx.tap(); store.set({ leftAlone: true }) } } },
    settled ? hide(1643, 1644, 1645, 1647) : {},
  )} />
}

/* ================= Blocked ================= */
const BL = [[1681, 1685, 1686, 1687, 1688], [1691, 1695, 1696, 1697, 1698], [1701, 1705, 1706, 1707, 1708], [1711, 1715, 1716, 1717, 1718]]
export function Blocked() {
  const { nav } = useApp()
  const [hov, setHov] = useState(0)
  return <Fig s={S.blocked} binds={B(
    { '232:1680': { dy: hov * 120, style: { transition: 'top .18s cubic-bezier(.22,1,.36,1)' } } },
    { '232:1685': { style: { left: 216 } } },
    ...BL.map((r, j) => ({ [id(r[0])]: { wrap: pop(0.15 + j * 0.1) } })),
  )} extra={BLOCKED.map((b, j) => (
    <button key={j} type="button" aria-label={`Room ${b.room} · ${b.title}`} onMouseEnter={() => setHov(j)} onFocus={() => setHov(j)}
      onClick={() => { fx.tap(); nav.go('blockedOne', { tr: 'none', p: { i: j } }) }}
      style={{ position: 'absolute', left: 140, top: 194 + 120 * j, width: 1210, height: 92, background: 'transparent', border: 0, cursor: 'pointer', borderRadius: 16 }} />
  ))} />
}
export function BlockedOne() {
  const { nav, setModal } = useApp()
  const i = P(nav, 'i', 0)
  const b = BLOCKED[i]
  const esc = store.use(x => x.escalated.includes(i))
  const [called, setCalled] = useState(false)
  return <Fig s={S.blockedOne} binds={B(
    txt(1751, `Room ${b.room} · ${b.title}`), txt(1752, b.sub),
    i ? txt(1779, `${b.why}.`) : {},
    { '232:1753': { wrap: rev('y', 0.1, 1.1) } },
    ...['1755', '1760', '1765', '1770', '1775'].map((n, k) => ({ [id(n)]: { wrap: pop(0.2 + k * 0.18) } })),
    { '232:1783': { wrap: slap(0.6) } },
    btn(1789, () => setModal({ kind: 'escalate', i }), 'Escalate'),
    btn(1791, () => setModal({ kind: 'reassign', i, from: 'blocked' }), 'Reassign'),
    btn(1793, () => { fx.success(); setCalled(true) }, 'Call ElectroServe'),
    called ? txt(1794, 'Called just now') : {},
    esc ? txt(1795, 'escalated to the warden · you stay on the job') : {},
  )} />
}
export const escalateBinds = (close: () => void, i: number, who: number, setWho: (n: number) => void, note: string, setNote: (s: string) => void): Binds => B(
  { '234:377': { style: { animation: 'figfade .2s ease both' } } },
  txt('234:381', `Escalate Room ${BLOCKED[i].room}?`),
  { '234:383': { onClick: () => { fx.select(); setWho(0) }, label: 'Warden', style: { background: who === 0 ? '#FFD265' : '#FFFBF3' } } },
  { '234:385': { onClick: () => { fx.select(); setWho(1) }, label: 'Estate office', style: { background: who === 1 ? '#FFD265' : '#FFFBF3' } } },
  field('234:387', note, setNote, { width: 516, placeholder: 'Add a line for them' }),
  btn('234:389', () => { fx.stamp(); store.set(s => ({ escalated: [...s.escalated, i] })); close() }, 'Escalate'),
  btn('234:391', close, 'Cancel'),
)

/* ================= Disputes ================= */
const DS = [
  [1921, 1922, 1923, 1927, 1928, 1929, 1933, 1934, 1935, 1936, 1937, 1938],
  [1939, 1940, 1941, 1945, 1946, 1947, 1951, 1952, 1953, 1954, 1955, 1956],
  [1957, 1958, 1959, 1963, 1964, 1965, 1969, 1970, 1971, 1972, 1973, 0],
]
export function Disputes() {
  const { nav } = useApp()
  const left = store.use(x => x.disputesLeft)
  const binds: Binds[] = []
  DS.forEach((sl, j) => {
    const k = left[j]
    if (k === undefined) { binds.push(hide(...sl.filter(Boolean))); if (j > 0) binds.push(hide(DS[j - 1][11] || 0)); return }
    const d = DISPUTES[k]
    binds.push(txt(sl[0], d.room), txt(sl[1], d.item), txt(sl[4], d.student), txt(sl[6], d.tech), txt(sl[7], d.techSays), txt(sl[10], d.open),
      { [id(sl[2])]: { wrap: place(0.1 + j * 0.12) }, [id(sl[5])]: { wrap: place(0.18 + j * 0.12) } },
      btn(sl[8], () => nav.go('disputeOne', { tr: 'none', p: { i: k } }), 'Open ' + d.room))
  })
  return <Fig s={S.disputes} binds={B(...binds)} />
}
export function DisputeOne() {
  const { nav, setModal } = useApp()
  const i = P(nav, 'i', 0)
  const d = DISPUTES[i]
  const settle = () => { fx.stamp(); store.set(s => ({ disputesLeft: s.disputesLeft.filter(x => x !== i) })); nav.reset('disputes', { tr: 'none' }) }
  return <Fig s={S.disputeOne} binds={B(
    txt(2004, `${d.room} · ${d.item}`), txt(2005, `The student says it is not fixed. ${d.tech} says it is.`), txt(2024, `${d.tech} says`),
    txt(2012, d.student), txt(2030, d.techSays),
    { '232:2007': { wrap: slap(0.2) }, '232:2025': { wrap: slap(0.4) } },
    i === 0 ? { '232:2013': { wrap: place(0.55) }, '232:2031': { wrap: place(0.7) } } : hide(2013, 2023, 2031, 2040, 2049),
    btn(2043, settle, 'Reopen the job'), btn(2045, settle, 'Uphold the closure'),
    btn(2047, () => setModal({ kind: 'reassign', i, from: 'dispute' }), 'Reassign'),
  )} />
}
const PICK = ['2 jobs today. Free from 4:30 PM.', 'Most jobs today. Free only at 5:30 PM.', 'Fewest jobs today. Free from 3:30 PM.']
export const reassignBinds = (close: () => void, m: NonNullable<Modal>, who: number, setWho: (n: number) => void, nav: NavApi<Screen>): Binds => B(
  { '234:469': { style: { animation: 'figfade .2s ease both' } } },
  txt('234:473', `Reassign ${m.from === 'blocked' ? 'Room ' + BLOCKED[m.i || 0].room : DISPUTES[m.i || 0].room}?`),
  ...[['234:475', 'Ravi'], ['234:486', 'Imran'], ['234:501', 'Deepak']].map(([c, name], k) => ({ [c]: { onClick: () => { fx.select(); setWho(k) }, label: name, style: { background: who === k ? '#FFD265' : '#FFFBF3' } } })),
  txt('234:508', PICK[who]),
  btn('234:509', () => {
    fx.stamp(); close()
    if (m.from === 'dispute') { store.set(s => ({ disputesLeft: s.disputesLeft.filter(x => x !== m.i) })); nav.reset('disputes', { tr: 'none' }) }
  }, 'Reassign'),
  btn('234:511', close, 'Cancel'),
)

/* ================= Fixtures ================= */
const FX = [
  [2204, 2205, 2206, [2207, 2210, 2213], 2217], [2220, 2221, 2222, [2223, 2226, 2229], 2233], [2236, 2237, 2238, [2239, 2242], 2246],
  [2249, 2250, 2251, [2252, 2255], 2259], [2262, 2263, 2264, [2265, 2268], 2272],
] as const
export function Fixtures() {
  const { nav } = useApp()
  return <Fig s={S.fixtures} binds={B(...FX.map((f, j) => B(
    ...f[3].map((r, k) => ({ [id(r)]: { wrap: pop(0.2 + j * 0.1 + k * 0.08) } })),
    btn(f[4], () => nav.go('fixtureOne', { tr: 'none', p: { i: j } }), 'Open ' + FIXTURES[j].room),
  )))} />
}
export function FixtureOne() {
  const { nav } = useApp()
  const i = P(nav, 'i', 0)
  const f = FIXTURES[i]
  const sugg = store.use(x => x.replaceSuggested.includes(i))
  return <Fig s={S.fixtureOne} binds={B(
    txt(2304, `${f.room} · ${f.item}`), txt(2305, f.sub),
    { '232:2306': { wrap: rev('y', 0.1, 1.0) }, '232:2308': { wrap: pop(0.25) }, '232:2313': { wrap: pop(0.45) }, '232:2318': { wrap: pop(0.65) }, '232:2323': { wrap: slap(0.5) } },
    i ? txt(2331, `Suggest replacing the ${f.item.toLowerCase()}`) : {},
    btn(2330, () => { if (!sugg) { fx.success(); store.set(s => ({ replaceSuggested: [...s.replaceSuggested, i] })) } }, 'Suggest replacing'),
    { '232:2332': { onClick: () => { fx.tap(); nav.back({ tr: 'none' }) } } },
    sugg ? B(txt(2331, 'Sent to the estate office'), hide(2332, 2334)) : {},
  )} />
}

/* ================= Team, Technician, Rules ================= */
export function Team() {
  const { nav } = useApp()
  const s = S.team
  const bookings = (s.k || []).filter(n => n.n === 'booking')
  const labels = (s.k || []).filter(n => n.t === 'TEX' && n.fn?.startsWith('DM Mono') && n.y > 250 && n.y < 700)
  const delayOf = (y: number) => 0.3 + Math.floor((y - 250) / 130) * 0.12
  return <Fig s={s} binds={B(
    ...['2373', '2386', '2397', '2408'].map((n, k) => ({ [id(n)]: { onClick: () => { fx.tap(); nav.go('tech', { tr: 'none', p: { i: k } }) } } })),
    { '232:2375': { wrap: rev('x', 0.1) }, '232:2388': { wrap: rev('x', 0.2) }, '232:2399': { wrap: rev('x', 0.3) }, '232:2410': { wrap: rev('x', 0.4) } },
    ...bookings.map(n => ({ [n.i]: { style: bar(delayOf(n.y) + (n.x - 500) / 2400) } })),
    ...labels.map(n => ({ [n.i]: { style: { animation: `figfade .3s ease ${delayOf(n.y) + (n.x - 500) / 2400 + 0.25}s both` } } })),
    { '232:2416': { wrap: rev('y', 0.9, 0.8) } },
    btn(2419, () => nav.go('rules', { tr: 'none' }), 'Notification rules'),
  )} />
}
const SHIFTS = ['10 AM to 6 PM', '10 AM to 2 PM', '2 to 6 PM']
const BLOCKSETS = [['BG, F, C', 'A, B', 'C, D', 'D, E'], ['A, B, C', 'D, E', 'BG, F', 'C']]
export function Tech() {
  const { nav } = useApp()
  const i = P(nav, 'i', 0)
  const shift = store.use(x => x.shift[i]), bs = store.use(x => x.blockSet[i])
  const t = TEAM[i]
  const blocks = bs ? BLOCKSETS[1][i] : t.blocks
  const bump = (k: 'shift' | 'blockSet', n: number) => { fx.select(); store.set(s => ({ [k]: s[k].map((v, j) => (j === i ? (v + 1) % n : v)) })) }
  return <Fig s={S.tech} binds={B(
    txt(2452, t.name), txt(2453, `Shift ${SHIFTS[shift]} · Blocks ${blocks} · Hindi and English`),
    i ? txt(2493, 'their phone shows Hindi big, English small') : {},
    { '232:2456': { wrap: pop(0.2, fx.check) }, '232:2463': { wrap: pop(0.35, fx.check) }, '232:2470': { wrap: pop(0.5) }, '232:2476': { wrap: pop(0.65) } },
    btn(2489, () => bump('blockSet', 2), 'Change blocks'), btn(2491, () => bump('shift', SHIFTS.length), 'Change shift'),
  )} />
}
/* Rules: each highlighted word is tappable; the yellow box resizes to the word and the rest of the sentence moves with it. */
const RULE_LINES: { pre: number; f: [number, number, string[]][]; tail: number[] }[] = [
  { pre: 2526, f: [[2527, 2528, ['3 days', '2 days', '5 days']], [2530, 2531, ['me', 'the warden', 'the technician']]], tail: [2529, 2532] },
  { pre: 2533, f: [[2534, 2535, ['5 days', '3 days', '7 days']], [2537, 2538, ['the warden', 'me', 'the estate office']]], tail: [2536, 2539] },
  { pre: 2540, f: [[2541, 2542, ['twice', 'once', 'three times']], [2544, 2545, ['pick a new time', 'call the technician']]], tail: [2543, 2546] },
  { pre: 2547, f: [[2548, 2549, ['evening at 6', 'morning at 10', 'afternoon at 2']]], tail: [2550] },
]
let ctx2d: CanvasRenderingContext2D | null = null
const measure = (s: string) => { ctx2d ??= document.createElement('canvas').getContext('2d'); ctx2d!.font = '800 30px "League Spartan"'; return ctx2d!.measureText(s).width }
export function Rules() {
  const rules = store.use(x => x.rules), saved = store.use(x => x.rulesSaved)
  const [, force] = useState(0)
  useEffect(() => { document.fonts?.ready.then(() => force(x => x + 1)) }, [])
  const nodeOf = (n: number) => S.rules.k!.find(k => k.i === id(n))!
  const binds: Binds[] = []
  let fi = 0
  RULE_LINES.forEach(line => {
    let shift = 0
    const order = [...line.f.map(f => f[0]), ...line.tail].sort((a, b) => nodeOf(a).x - nodeOf(b).x)
    const fieldOf = new Map(line.f.map(f => [f[0], f]))
    for (const nid of order) {
      const f = fieldOf.get(nid)
      const rect = nodeOf(nid)
      if (!f) { binds.push({ [id(nid)]: { style: { left: rect.x + shift } } }); continue }
      const k = fi++
      const word = f[2][rules[k] % f[2].length]
      const textNode = nodeOf(f[1])
      const w = Math.round(measure(word)) + (rect.w - textNode.w)
      binds.push(
        { [id(f[0])]: { onClick: () => { fx.select(); store.set(s => ({ rulesSaved: false, rules: s.rules.map((v, j) => (j === k ? v + 1 : v)) })) }, label: 'Change: ' + word, style: { left: rect.x + shift, width: w, transition: 'width .15s' } } },
        { [id(f[1])]: { text: word, style: { left: textNode.x + shift, width: 'auto' } } },
      )
      shift += w - rect.w
    }
  })
  return <Fig s={S.rules} binds={B(...binds,
    btn(2554, () => { fx.success(); store.set({ rulesSaved: true }) }, 'Save rules'),
    saved ? txt(2555, 'Saved ✓') : {},
  )} />
}

/* ================= Errors ================= */
export function E404() {
  const { nav } = useApp()
  return <Fig s={S.e404} binds={B({ '236:622': { wrap: settle(0.1) } }, btn('236:630', () => nav.reset('desk', { tr: 'none' }), 'Back to the desk'), btn('236:632', () => nav.reset('check', { tr: 'none' }), 'Go to To check'))} />
}
export function Offline() {
  const { nav } = useApp()
  const [tries, setTries] = useState(0)
  return <Fig s={S.offline} binds={B({ '236:952': { wrap: settle(0.1) } },
    btn('236:960', () => { if (navigator.onLine) { fx.success(); nav.reset('desk', { tr: 'none' }) } else { fx.error(); setTries(t => t + 1) } }, 'Try again'),
    tries ? txt('236:965', `Still no connection · tried ${tries} time${tries > 1 ? 's' : ''}`) : {},
    btn('236:962', () => nav.reset('desk', { tr: 'none' }), 'View last loaded desk'))} />
}
export function E500() {
  const { nav } = useApp()
  return <Fig s={S.e500} binds={B({ '236:1284': { wrap: settle(0.1) } }, btn('236:1292', () => nav.reset('desk', { tr: 'none' }), 'Try again'), btn('236:1294', () => nav.reset('desk', { tr: 'none' }), 'Back to the desk'))} />
}

export const SCREENS: Record<Screen, () => React.ReactElement> = {
  signin: SignIn, desk: Desk, check: Check, review: Review, closure: Closure, forecast: Forecast, blocked: Blocked, blockedOne: BlockedOne,
  disputes: Disputes, disputeOne: DisputeOne, fixtures: Fixtures, fixtureOne: FixtureOne, team: Team, tech: Tech, rules: Rules,
  e404: E404, offline: Offline, e500: E500, expired: Expired,
}
/** Which rail item is lit for each screen (as in the Figma). */
export const RAIL_OF: Record<Screen, number> = {
  signin: -1, expired: -1, desk: 0, check: 1, review: 1, closure: 1, forecast: 2, blocked: 3, blockedOne: 3, disputes: 4, disputeOne: 4,
  fixtures: 5, fixtureOne: 5, team: 6, tech: 6, rules: 6, e404: 0, offline: 0, e500: 0,
}
