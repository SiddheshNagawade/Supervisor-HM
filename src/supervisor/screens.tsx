import { ReactNode, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check as CheckIcon, Search, WifiOff, X, ArrowRight, Merge, Clock3, Camera, KeyRound, ShieldAlert, Phone, Users, Undo2, Sparkles, AlertTriangle, ChevronRight, CircleCheck, Send, RotateCcw, Wrench, Mail, Lock, Eye, EyeOff, Zap, Droplets, Hammer, BrickWall, TrendingUp, CalendarDays, OctagonAlert, Flag } from '../ds/icons'
import { Art, Avatar, Button, Card, Chip, Choice, Dialog, Segmented, Tag, TextArea, TextField, Toggle, Tooltip, cx, Divider, Stars } from '../ds/ui'
import { CountUp, Drop, Rise, Words, Stamp, ArtIn, spring, springPop, Pop } from '../ds/motion'
import { fx } from '../ds/fx'
import { ago, dayTime, Trade } from '../data/iitr'
import { Page, H2, Dot, SearchBox, useApp, Screen } from './shell'
import { store, setRep, Rep, TEAM, techName, FIXTURES, ageDays, ageText } from './store'

const TRADE_ICON: Record<Trade, ReactNode> = { Electrical: <Zap size={18} />, Plumbing: <Droplets size={18} />, Carpentry: <Hammer size={18} />, Civil: <BrickWall size={18} /> }
const Photo = ({ n, cap, w = 260 }: { n: string; cap: string; w?: number }) => (
  <figure className="m-0 inline-block overflow-hidden rounded-[10px] border border-line bg-paper shadow-desk" style={{ width: w }}>
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-sand"><Art n={n} className="h-full w-auto" /></div>
    <figcaption className="border-t border-rule px-3 py-2 text-[13px] text-mid">{cap}</figcaption>
  </figure>
)
/** A quoted message from a student or technician: a left rule in their colour, no sticky-note theatrics. */
const Sticky = ({ who, children, tone = 'sun' }: { who: string; children: ReactNode; tone?: 'sun' | 'sky' }) => (
  <blockquote className={cx('m-0 rounded-r-[10px] border-l-[3px] py-3 pl-4 pr-4', tone === 'sun' ? 'border-sun bg-sun2/70' : 'border-canal bg-canal2/60')}>
    <div className="text-[12px] font-semibold text-mid">{who}</div><div className="mt-1 text-[15px] leading-relaxed text-ink">{children}</div>
  </blockquote>
)
/** Calm empty-state mark in place of the mascot on the desk. */
const Mark = ({ children, tone = 'canal' }: { children: ReactNode; tone?: 'canal' | 'green' | 'sun' | 'brick' }) => (
  <span className={cx('flex h-14 w-14 items-center justify-center rounded-full', { canal: 'bg-canal2 text-canal', green: 'bg-green2 text-green', sun: 'bg-sun2 text-navy', brick: 'bg-brick2 text-brick' }[tone])}>{children}</span>
)

/* ------------------------------ Sign in ------------------------------ */
export function Login() {
  const { nav } = useApp()
  const [email, setEmail] = useState('meera.joshi@iitr.ac.in'); const [pw, setPw] = useState('••••••••••'); const [show, setShow] = useState(false)
  const [err, setErr] = useState(''); const [k, setK] = useState(0); const [busy, setBusy] = useState(false)
  const go = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/@([a-z]+\.)?iitr\.ac\.in$/i.test(email)) { fx.error(); setK(x => x + 1); setErr('Use your IIT Roorkee email'); return }
    setBusy(true); setTimeout(() => { store.set({ signedIn: true }); fx.success(); nav.reset('home', { tr: 'swap' }) }, 700)
  }
  const cols = [7, 6, 4, 5, 3, 2]
  return (
    <div className="flex h-full bg-cream">
      <div className="relative flex w-[46%] flex-col overflow-hidden bg-navy p-12 text-cream">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sun font-head text-[21px] font-bold text-navy"><span className="pt-[3px]">A</span></span><span className="font-head text-[22px] font-bold tracking-[0.14em]">ALIGN</span></div>
        <div className="mb-10 mt-auto flex items-end gap-5" aria-hidden>
          {cols.map((c, i) => <div key={i} className="flex flex-col-reverse gap-2">{Array.from({ length: c }, (_, j) => <motion.span key={j} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.04 + j * 0.02 }} className={cx('h-3.5 w-3.5 rounded-full', i === 3 && j === 4 ? 'bg-sun' : 'bg-cream/85')} />)}</div>)}
        </div>
        <Words text="Every request, counted and visible." className="max-w-[440px] font-head text-[32px] font-bold leading-tight" />
        <p className="mt-3 max-w-[420px] text-[16px] text-cream/80">The desk for the people who keep a Bhawan running. Students report, IWD fixes, you see it all in one place.</p>
      </div>
      <form onSubmit={go} className="flex flex-1 flex-col justify-center px-[10%]">
        <Rise><h1 className="font-head text-[32px] font-bold">Sign in</h1><p className="mt-1 text-[15px] text-mid">Supervisor desk · Himalaya Bhawan</p></Rise>
        <Rise delay={0.08} className="mt-8 flex max-w-[400px] flex-col gap-4">
          <TextField label="Work email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErr('') }} prefix={<Mail size={20} />} error={err} shakeKey={k} />
          <TextField label="Password" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} prefix={<Lock size={20} />}
            suffix={<Tooltip label={show ? 'Hide password' : 'Show password'}><button type="button" onClick={() => setShow(!show)} aria-label="Show password" className="flex">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button></Tooltip>} />
        </Rise>
        <Rise delay={0.14} className="mt-7 flex max-w-[400px] items-center gap-5"><Button type="submit" variant="primary" size="lg" full={false} loading={busy} className="min-w-[140px]">Sign in</Button><button type="button" className="text-[14px] font-medium text-mid hover:text-navy hover:underline underline-offset-4">Forgot password?</button></Rise>
      </form>
    </div>
  )
}

/* ------------------------------ Home ------------------------------ */
/** One figure in a KPI strip. The strip is a single panel split by hairlines. */
function Kpi({ n, label, sub, tone = 'navy', onClick, decimals = 0 }: { n: number; label: string; sub: string; tone?: 'navy' | 'brick' | 'canal' | 'green'; onClick?: () => void; i?: number; decimals?: number }) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-[13px] font-medium text-mid"><span className={cx('h-2 w-2 rounded-full', { navy: 'bg-navy', brick: 'bg-brick', canal: 'bg-canal', green: 'bg-green' }[tone])} />{label}</div>
      <div className={cx('mt-2 font-head text-[34px] font-bold leading-none tabular', { navy: 'text-navy', brick: 'text-brick', canal: 'text-canal', green: 'text-green' }[tone])}><CountUp to={n} decimals={decimals} /></div>
      <div className="mt-1.5 text-[13px] text-mid">{sub}</div>
    </>
  )
  return onClick
    ? <button onClick={() => { fx.tap(); onClick() }} className="group px-6 py-5 text-left transition-colors hover:bg-cream">{body}</button>
    : <div className="px-6 py-5">{body}</div>
}
const KpiStrip = ({ children, cols = 4 }: { children: ReactNode; cols?: number }) => (
  <div className={cx('grid divide-x divide-rule overflow-hidden rounded-[12px] border border-line bg-paper shadow-desk', cols === 3 ? 'grid-cols-3' : 'grid-cols-4')}>{children}</div>
)
export function HomeScreen() {
  const { nav } = useApp()
  const reps = store.use(s => s.reps); const promise = store.use(s => s.promise)
  const open = reps.filter(r => !['closed', 'merged', 'rejected'].includes(r.status))
  const days = ['Today', '1d', '2d', '3d', '4d', '5d', '6d', '7d+']
  const cols = [7, 5, 4, 4, 3, 2, 3, 1]
  const blocks = [['Block B', 12, 2], ['Block C', 9, 1], ['Block A', 8, 1], ['Block D', 4, 0]] as const
  const hour = new Date().getHours()
  const needs = [
    { t: 'Burning smell, room A-018', b: 'Marked dangerous 1 hour ago. Warden alerted. Needs a technician tonight.', tone: 'brick' as const, a: <Button size="sm" variant="danger" full={false} onClick={() => nav.go('review', { tr: 'swap', p: { id: '2415' } })}>Assign now</Button> },
    { t: 'Pump motor, blocked 6 days', b: 'Not in stock and the purchase is not approved. Past your 3 day promise.', tone: 'canal' as const, a: <Button size="sm" variant="primary" full={false} onClick={() => nav.go('blockedOne', { tr: 'swap', p: { id: '2381' } })}>Escalate</Button> },
    { t: `${reps.filter(r => r.status === 'closure').length} closures to sign off`, b: 'Oldest from 4 days ago. Three were closed with the student\'s code.', tone: 'navy' as const, a: <Button size="sm" variant="secondary" full={false} onClick={() => nav.go('check', { tr: 'swap', p: { tab: 'closures' } })}>Review all</Button> },
  ]
  return (
    <Page wide title={`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, Meera.`} sub={`Three things need you. Everything else is moving: ${open.length} open, 4 technicians on shift.`}
      right={<Segmented value={store.use(s => s.bhawan)} onChange={v => store.set({ bhawan: v })} options={['All blocks', 'A', 'B', 'C'].map(v => ({ v, label: v === 'All blocks' ? 'All' : `Block ${v}` }))} tone="canal" />}>
      <KpiStrip>
        <Kpi i={0} n={open.length} label="Open requests" sub="Across all blocks" onClick={() => nav.go('check', { tr: 'swap' })} />
        <Kpi i={1} n={reps.filter(r => r.status === 'new').length} label="Waiting for you" sub="New reports to check" tone="canal" onClick={() => nav.go('check', { tr: 'swap' })} />
        <Kpi i={2} n={4} label={`Past ${promise} days`} sub="Your promise to students" tone="brick" onClick={() => nav.go('blocked', { tr: 'swap' })} />
        <Kpi i={3} n={6.2} decimals={1} label="Hours to fix" sub="Average this week, down 1.4" tone="green" />
      </KpiStrip>
      <div className="mt-10 grid grid-cols-[1fr_360px] gap-12">
        <div>
          <H2 right={<span className="text-[14px] text-mid">each dot is one request</span>}>Every open request, by how long it has waited</H2>
          <div className="relative mt-6 flex h-[220px] items-end justify-between border-b border-navy/40 px-4 pb-1">
            <div className="absolute bottom-0 top-0 border-l-[1.5px] border-dashed border-brick" style={{ left: `calc(${(promise / 8) * 100}% + 18px)` }}><span className="absolute -top-1 left-2 whitespace-nowrap text-[12px] font-medium text-brick">promise: {promise} days</span></div>
            {days.map((d, i) => (
              <div key={d} className="relative flex w-10 flex-col items-center">
                <div className="flex flex-col-reverse gap-1.5">
                  {Array.from({ length: cols[i] }, (_, k) => (
                    <Tooltip key={k} label={`${d === 'Today' ? 'Reported today' : `Waiting ${d}`}${i >= promise ? ' · past the promise' : ''}`}>
                      <motion.span className="block" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.03 + k * 0.015 }}><Dot tone={i === 6 && k === 2 ? 'brick' : i >= promise ? 'ring' : 'navy'} size={14} /></motion.span>
                    </Tooltip>
                  ))}
                </div>
                <span className="absolute -bottom-8 text-[13px] text-mid">{d}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex gap-6 text-[13px] text-mid"><span className="flex items-center gap-2"><Dot />waiting</span><span className="flex items-center gap-2"><Dot tone="ring" />past the promise</span><span className="flex items-center gap-2"><Dot tone="brick" />blocked</span></div>
          <H2 className="mt-10">Where it is piling up</H2>
          {blocks.map(([b, n, x], i) => (
            <Rise key={b} delay={0.3 + i * 0.05}>
              <button onClick={() => { fx.tap(); nav.go('check', { tr: 'swap' }) }} className="group flex w-full items-center gap-6 border-b border-line py-3.5 text-left hover:bg-navy/[0.03]">
                <span className="w-24 text-[15px] font-semibold">{b}</span>
                <span className="flex w-[280px] gap-1.5">{Array.from({ length: n }, (_, k) => <Dot key={k} tone={k >= n - x ? 'brick' : 'navy'} />)}</span>
                <span className="flex-1 text-[14px] text-mid">{n} open{x ? <span className="font-semibold text-brick"> · {x} blocked</span> : ''}</span>
                <ChevronRight className="text-faint transition-transform group-hover:translate-x-1" />
              </button>
            </Rise>
          ))}
        </div>
        <aside>
          <H2>Needs you</H2>
          <div className="flex flex-col gap-3">
            {needs.map((x, i) => (
              <Drop key={x.t} delay={0.2 + i * 0.08} from={i % 2 ? 2 : -2}>
                <div className="relative overflow-hidden rounded-[12px] border border-line bg-paper p-4 pl-5 shadow-desk">
                  <span className={cx('absolute bottom-0 left-0 top-0 w-[3px]', { brick: 'bg-brick', canal: 'bg-canal', navy: 'bg-navy' }[x.tone])} />
                  <div className="flex items-start gap-3"><span className="mt-0.5 font-mono text-[13px] text-faint">0{i + 1}</span>
                    <div><div className="text-[15px] font-semibold leading-snug">{x.t}</div><p className="mt-1 text-[14px] leading-relaxed text-mid">{x.b}</p><div className="mt-3">{x.a}</div></div></div>
                </div>
              </Drop>
            ))}
          </div>
        </aside>
      </div>
    </Page>
  )
}

/* ------------------------------ To check ------------------------------ */
export function CheckScreen() {
  const { nav, toast } = useApp()
  const reps = store.use(s => s.reps)
  const [tab, setTab] = useState<'new' | 'closures'>((nav.params.tab as 'closures') || 'new')
  const [q, setQ] = useState('')
  const list = reps.filter(r => (tab === 'new' ? r.status === 'new' : r.status === 'closure')).filter(r => `${r.room} ${r.item} ${r.issue} ${r.student}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || a.at - b.at)
  const quick = (r: Rep) => {
    const prev = r.status
    setRep(r.id, tab === 'new' ? { status: 'assigned', tech: TEAM.find(t => t.trade === r.trade)?.id } : { status: 'closed' }); fx.check()
    toast({ kind: 'bar', title: tab === 'new' ? `${r.room} accepted` : `${r.room} closure signed off`, body: tab === 'new' ? `Sent to ${techName(TEAM.find(t => t.trade === r.trade)?.id)}` : 'Student notified', icon: <CircleCheck size={20} />, action: { label: 'Undo', run: () => setRep(r.id, { status: prev }) } })
  }
  return (
    <Page title="To check" sub="Reports and closures wait here until you say yes. Oldest first, so nothing hides." right={<SearchBox value={q} onChange={setQ} />}>
      <Segmented tone="canal" value={tab} onChange={setTab} options={[{ v: 'new', label: 'New reports', count: reps.filter(r => r.status === 'new').length }, { v: 'closures', label: 'Closures', count: reps.filter(r => r.status === 'closure').length }]} />
      <div className="mt-5 overflow-hidden rounded-[12px] border border-line bg-paper shadow-desk">
        <div className="grid grid-cols-[110px_1.6fr_1fr_100px_220px] gap-4 border-b border-line bg-sand/60 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-mid"><span>Room</span><span>Problem</span><span>{tab === 'new' ? 'Reported by' : 'Closed by'}</span><span>Waiting</span><span className="text-right">Action</span></div>
        <AnimatePresence initial={false}>
          {list.map((r, i) => (
            <motion.div key={r.id} layout initial={false} exit={{ opacity: 0, x: 60, height: 0, transition: { duration: 0.25 } }}
              className="group grid cursor-pointer grid-cols-[110px_1.6fr_1fr_100px_220px] items-center gap-4 border-b border-rule px-5 py-3.5 last:border-0 hover:bg-cream"
              onClick={() => { fx.tap(); nav.go(tab === 'new' ? 'review' : 'closure', { tr: 'swap', p: { id: r.id } }) }}>
              <span className="flex items-center gap-2.5"><Dot tone={r.urgent ? 'brick' : ageDays(r.at) >= 3 ? 'ring' : 'navy'} /><span className="font-mono text-[15px] font-medium">{r.room}</span></span>
              <span className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-sand text-mid">{TRADE_ICON[r.trade]}</span><span className="min-w-0"><span className="block truncate text-[15px] font-semibold">{r.item} · {r.issue.toLowerCase()}</span><span className="block truncate text-[13px] text-mid">{r.trade}{r.photo ? ' · photo' : ''}{r.shared ? ` · ${r.shared} students` : ''}{r.dupOf ? ' · possible duplicate' : ''}</span></span>{r.urgent && <Tag tone="danger" icon={<AlertTriangle size={13} />}>Dangerous</Tag>}</span>
              <span className="truncate text-[14px]">{tab === 'new' ? r.student : `${techName(r.tech)} · ${r.closedBy === 'code' ? 'code' : 'photo'}`}</span>
              <span className={cx('font-mono text-[14px]', ageDays(r.at) >= 3 && 'font-medium text-brick')}>{ageText(r.at)}</span>
              <span className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="secondary" full={false} onClick={() => nav.go(tab === 'new' ? 'review' : 'closure', { tr: 'swap', p: { id: r.id } })}>Open</Button>
                <Tooltip label={tab === 'new' ? 'Accept and send to the usual technician' : 'Sign off this closure'}><Button size="sm" variant="canal" full={false} icon={<CheckIcon size={16} strokeWidth={3} />} sound={false} onClick={() => quick(r)}>{tab === 'new' ? 'Accept' : 'Sign off'}</Button></Tooltip>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!list.length && <div className="flex flex-col items-center py-14 text-center"><Mark tone="green"><CircleCheck size={26} /></Mark><div className="mt-3 text-[17px] font-semibold">All checked</div><p className="text-[15px] text-mid">{q ? 'Nothing matches your search.' : 'Nothing is waiting for you here.'}</p></div>}
      </div>
    </Page>
  )
}

/* ------------------------------ Review a report ------------------------------ */
export function Review() {
  const { nav, toast } = useApp()
  const reps = store.use(s => s.reps)
  const r = reps.find(x => x.id === nav.params.id) || reps.find(x => x.status === 'new') || reps[0]
  const dup = reps.find(x => x.id === r.dupOf)
  const fits = TEAM.filter(t => t.trade === r.trade || r.trade === 'Civil')
  const [tech, setTech] = useState(fits[0]?.id || 't1')
  const [merge, setMerge] = useState(false); const [reject, setReject] = useState(false); const [why, setWhy] = useState('')
  const done = (msg: string, body: string) => { toast({ kind: 'bar', title: msg, body, icon: <CircleCheck size={20} /> }); nav.reset('check', { tr: 'swap' }) }
  return (
    <Page back title={`${r.room} · ${r.item}`} sub={`${r.issue} · Block ${r.block} · reported ${ago(r.at)} by ${r.student}`} right={r.urgent ? <Tag tone="danger" icon={<AlertTriangle size={14} />}>Marked dangerous</Tag> : undefined}>
      <div className="grid grid-cols-[300px_1fr] gap-12">
        <div className="flex flex-col gap-6">
          {r.photo ? <ArtIn><Photo n={r.photo} cap={`${r.item.toLowerCase()}, ${r.room}`} w={300} /></ArtIn> : <Card variant="flat" className="flex h-[200px] flex-col items-center justify-center gap-2 text-mid"><Camera size={28} />No photo</Card>}
          {r.note && <Drop delay={0.1}><Sticky who={r.student}>"{r.note}"</Sticky></Drop>}
        </div>
        <div>
          {dup && (
            <Rise>
              <H2 right={<span className="text-[13px] font-medium text-brick">same room, same fixture</span>}>Looks like the same problem</H2>
              <div className="flex items-center justify-between gap-4 rounded-[10px] border border-dashed border-navy/30 bg-sand/60 p-4">
                <div><div className="font-semibold">{dup.room} · {dup.item.toLowerCase()} {dup.issue.toLowerCase()}</div><div className="text-[14px] text-mid">Sent {ago(dup.at)} by {dup.student} · already with {techName(dup.tech)}</div></div>
                <Button size="sm" variant="secondary" full={false} icon={<Merge size={16} />} onClick={() => setMerge(true)}>Merge</Button>
              </div>
            </Rise>
          )}
          <Rise delay={0.08}><H2 className="mt-8">Assign to</H2></Rise>
          <div className="grid grid-cols-3 gap-3">
            {fits.map(t => (
              <Choice key={t.id} tone="canal" layout="row" on={tech === t.id} onClick={() => setTech(t.id)} title={t.name}
                sub={`${t.trade} · ${t.today} of ${t.cap} tonight`} badge={<span className="flex shrink-0 gap-0.5" aria-hidden>{Array.from({ length: t.cap }, (_, k) => <span key={k} className={cx('h-1.5 w-1.5 rounded-full', k < t.today ? 'bg-navy' : 'bg-navy/15')} />)}</span>} />
            ))}
          </div>
          <Rise delay={0.12} className="mt-5 flex items-center gap-2 text-[14px] text-mid"><Clock3 size={17} />Promise to the student: fixed within {store.get().promise} days{r.urgent ? '. Dangerous: same evening.' : '.'}</Rise>
          <Rise delay={0.16} className="mt-8 flex items-center gap-4">
            <Button variant="primary" size="md" full={false} icon={<Send size={17} />} onClick={() => { setRep(r.id, { status: 'assigned', tech }); fx.success(); done(`${r.room} sent to ${techName(tech)}`, 'The student has been told') }}>Accept and assign</Button>
            <Button variant="ghost" size="md" full={false} className="!text-brick" onClick={() => setReject(true)}>Not a real problem</Button>
          </Rise>
        </div>
      </div>
      <Dialog open={merge} onClose={() => setMerge(false)} title="Merge these two reports?"
        footer={<><Button variant="primary" size="md" full={false} icon={<Merge size={18} />} onClick={() => { setRep(r.id, { status: 'merged' }); setMerge(false); fx.success(); done('Reports merged', `${r.room} is now one job`) }}>Merge</Button><Button variant="secondary" size="md" full={false} onClick={() => setMerge(false)}>Keep separate</Button></>}>
        <p className="text-[16px] text-mid">They become one job for {r.room}. Both students keep getting updates, and the technician sees one {r.item.toLowerCase()} to fix.</p>
        {dup && <div className="mt-5 flex items-center gap-3"><Card variant="outline" className="flex-1 p-3"><div className="font-semibold">{r.item} {r.issue.toLowerCase()}</div><div className="text-[14px] text-mid">{r.student} · {ago(r.at)}</div></Card><ArrowRight size={20} className="text-mid" /><Card variant="outline" className="flex-1 !border-canal p-3"><div className="font-semibold">{dup.item} {dup.issue.toLowerCase()}</div><div className="text-[14px] text-mid">{dup.student} · {ago(dup.at)}</div></Card></div>}
      </Dialog>
      <Dialog open={reject} onClose={() => setReject(false)} title="Close as not a real problem?"
        footer={<><Button variant="danger" size="md" full={false} disabled={!why} onClick={() => { setRep(r.id, { status: 'rejected' }); setReject(false); done(`${r.room} closed`, 'The student was told why') }}>Close it</Button><Button variant="secondary" size="md" full={false} onClick={() => setReject(false)}>Cancel</Button></>}>
        <p className="text-[16px] text-mid">The student gets your reason. Pick one:</p>
        <div className="mt-4 flex flex-wrap gap-2">{['Already fixed', 'Not hostel property', 'Needs the warden, not IWD', 'Duplicate'].map(x => <Chip key={x} tone="canal" on={why === x} onClick={() => setWhy(x)}>{x}</Chip>)}</div>
      </Dialog>
    </Page>
  )
}

/* ------------------------------ Closure review ------------------------------ */
export function Closure() {
  const { nav, toast } = useApp()
  const reps = store.use(s => s.reps)
  const queue = reps.filter(r => r.status === 'closure')
  const r = reps.find(x => x.id === nav.params.id && x.status === 'closure') || queue[0]
  const [stamp, setStamp] = useState(0)
  if (!r) return <Page back title="All closures signed off"><div className="flex flex-col items-center py-16"><Mark tone="green"><CircleCheck size={26} /></Mark><p className="mt-4 text-[16px] text-mid">Nothing left to sign off. Good evening's work.</p><Button className="mt-6" variant="primary" size="md" full={false} onClick={() => nav.reset('home', { tr: 'swap' })}>Back to home</Button></div></Page>
  const idx = queue.findIndex(x => x.id === r.id)
  const accept = () => {
    setStamp(s => s + 1)
    setTimeout(() => { setRep(r.id, { status: 'closed' }); const nx = queue[idx + 1] || queue.find(x => x.id !== r.id); toast({ kind: 'bar', title: `${r.room} signed off`, icon: <CircleCheck size={20} /> }); if (nx) nav.replace('closure', { tr: 'swap', p: { id: nx.id } }); else nav.reset('check', { tr: 'swap' }) }, 900)
  }
  const checks: [string, boolean][] = [[r.closedBy === 'code' ? "Closed with the student's code" : 'Closed with a photo, no code (shared space)', r.closedBy === 'code'], ['Student said: fixed', r.closedBy === 'code'], ['After photo attached', true]]
  return (
    <Page back title="Closure review" sub={`${r.room} · ${r.item} · closed by ${techName(r.tech)}`} right={<span className="flex items-center gap-2 font-mono text-[15px] text-mid">{queue.map((q, i) => <Dot key={q.id} tone={i < idx ? 'green' : i === idx ? 'sun' : 'faint'} />)}<span className="ml-1">{idx + 1} of {queue.length}</span></span>}>
      <div className="grid grid-cols-[1fr_360px] gap-12">
        <div className="relative flex items-start gap-6">
          <ArtIn><Photo n={r.item === 'Chair' ? 'photo-chair' : 'photo-fan'} cap="before" /></ArtIn>
          <ArtIn delay={0.1}><Photo n={r.item === 'Chair' ? 'photo-chair-after' : 'photo-fan'} cap="after" /></ArtIn>
          <AnimatePresence>{stamp > 0 && <Stamp key={stamp} delay={0} onLand={fx.stamp} className="absolute left-[200px] top-[60px]"><div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-4 border-green bg-paper/80 text-green"><CheckIcon size={40} strokeWidth={3.5} /><span className="font-head text-[17px] font-bold tracking-[0.14em]">SIGNED</span></div></Stamp>}</AnimatePresence>
        </div>
        <div>
          <H2>What {techName(r.tech).split(' ')[0]} did</H2>
          <p className="text-[15px] leading-relaxed">{r.fix}</p>
          <div className="mt-5 flex flex-col gap-3">{checks.map(([t, ok], i) => <Rise key={t} delay={0.1 + i * 0.06} className="flex items-center gap-3 text-[14px] font-medium"><span className={cx('flex h-6 w-6 items-center justify-center rounded-full', ok ? 'bg-green2 text-green' : 'bg-sun2 text-navy')}>{ok ? <CheckIcon size={14} strokeWidth={2.8} /> : <Eye size={14} />}</span>{t}</Rise>)}</div>
          <div className="mt-8 flex items-center gap-3"><Button variant="primary" size="md" full={false} icon={<CheckIcon size={17} strokeWidth={2.6} />} sound={false} onClick={accept}>Sign off</Button><Button variant="ghost" size="md" full={false} className="!text-brick" icon={<RotateCcw size={18} />} onClick={() => { setRep(r.id, { status: 'assigned' }); toast({ kind: 'bar', title: `${r.room} sent back to ${techName(r.tech)}`, icon: <RotateCcw size={18} /> }); nav.back({ tr: 'swap' }) }}>Send back</Button></div>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------ Forecast ------------------------------ */
export function Forecast() {
  const { toast } = useApp()
  const moved = store.use(s => s.forecastMoved)
  const [trade, setTrade] = useState<'all' | Trade>('all')
  const base: [string, number][] = [['Sat', 7], ['Sun', 6], ['Mon', 7], ['Tue', 12], ['Wed', 9], ['Thu', 6], ['Fri', 7]]
  const data = base.map(([d, n]) => [d, trade === 'all' ? n : Math.max(1, Math.round(n * ({ Electrical: 0.45, Plumbing: 0.3, Carpentry: 0.2, Civil: 0.05 } as Record<Trade, number>)[trade]))] as [string, number])
  if (moved && trade === 'all') { data[2][1] = 9; data[3][1] = 10 }
  const cap = trade === 'all' ? 9 : 4
  return (
    <Page title="Load forecast" sub="The next seven days: work expected against what your technicians can do. Based on the last 8 weeks and the monsoon pattern."
      right={<Segmented tone="canal" value={trade} onChange={setTrade} options={[{ v: 'all', label: 'All' }, { v: 'Electrical', label: 'Electrical' }, { v: 'Plumbing', label: 'Plumbing' }, { v: 'Carpentry', label: 'Carpentry' }]} />}>
      <div className="relative flex h-[360px] items-end justify-around rounded-[12px] border border-line bg-paper px-8 pb-12 pt-6 shadow-desk">
        <motion.div className="absolute left-6 right-6 border-t-[1.5px] border-dashed border-brick" animate={{ bottom: 48 + cap * 20 }} transition={spring}><span className="absolute -top-6 right-0 text-[12px] font-medium text-brick">what {trade === 'all' ? '4 technicians' : `your ${trade.toLowerCase()} team`} can do</span></motion.div>
        {data.map(([d, n], i) => (
          <div key={d} className="relative flex flex-col items-center">
            <div className="flex flex-col-reverse gap-1.5">{Array.from({ length: n }, (_, k) => <motion.span key={`${trade}${k}`} className="block" layout initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: i * 0.03 + k * 0.015 }}><Dot size={14} tone={k >= cap ? 'brick' : 'navy'} /></motion.span>)}</div>
            <span className={cx('absolute -bottom-9 text-[13px] font-medium text-mid', d === 'Tue' && !moved && '!text-brick')}>{d}</span>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!moved ? (
          <Drop key="s" className="mt-8">
            <div className="flex items-center gap-5 rounded-[12px] border border-sun3 bg-sun2 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun"><Sparkles size={20} /></span>
              <p className="flex-1 text-[15px]"><b>Tuesday has 3 jobs too many.</b> Moving the two non-urgent carpentry jobs to Monday keeps every promise.</p>
              <Button variant="primary" size="md" full={false} onClick={() => { store.set({ forecastMoved: true }); fx.success(); toast({ kind: 'bar', title: 'Two jobs moved to Monday', body: 'Students were told', action: { label: 'Undo', run: () => store.set({ forecastMoved: false }) } }) }}>Move two to Monday</Button>
              <Button variant="ghost" size="md" full={false}>Leave it</Button>
            </div>
          </Drop>
        ) : <Rise key="d" className="mt-8 flex items-center gap-3 text-[15px] font-semibold text-green"><CircleCheck />Every day is within capacity now.</Rise>}
      </AnimatePresence>
    </Page>
  )
}

/* ------------------------------ Blocked ------------------------------ */
export function Blocked() {
  const { nav } = useApp()
  const list = store.use(s => s.reps).filter(r => r.status === 'blocked').sort((a, b) => (a.blockedSince || 0) - (b.blockedSince || 0))
  return (
    <Page title="Blocked" sub="Jobs that cannot move until something outside the team changes. Click one for the whole story.">
      <div className="flex flex-col gap-3">
        {list.map((r, i) => (
          <Rise key={r.id} delay={i * 0.05}>
            <Card variant="outline" onClick={() => nav.go('blockedOne', { tr: 'swap', p: { id: r.id } })} className="relative flex items-center gap-5 overflow-hidden p-5">{i === 0 && <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-brick" />}
              <Dot tone="brick" size={14} /><span className="w-28 font-mono text-[15px] font-medium">{r.room}</span>
              <span className="flex-1"><span className="block text-[16px] font-semibold">{r.item}</span><span className="text-[14px] text-mid">{r.blockedWhy}</span></span>
              <span className="text-right"><span className={cx('block font-head text-[26px] font-bold leading-none tabular', ageDays(r.blockedSince || r.at) > store.get().promise ? 'text-brick' : 'text-navy')}>{ageDays(r.blockedSince || r.at)}d</span><span className="text-[13px] text-mid">blocked</span></span>
              <ChevronRight className="text-faint" />
            </Card>
          </Rise>
        ))}
        {!list.length && <div className="flex flex-col items-center py-16 text-center"><Mark tone="green"><CircleCheck size={26} /></Mark><p className="mt-3 text-[16px] text-mid">Nothing is blocked.</p></div>}
      </div>
    </Page>
  )
}

export function BlockedOne() {
  const { nav, toast } = useApp()
  const reps = store.use(s => s.reps)
  const r = reps.find(x => x.id === nav.params.id) || reps.find(x => x.status === 'blocked') || reps[0]
  const [esc, setEsc] = useState(false); const [to, setTo] = useState('Warden'); const [line, setLine] = useState('')
  const story = [['6 days ago', 'Reported by the warden'], ['5 days ago', `${techName(r.tech)} visited. The motor is burnt out.`], ['5 days ago', 'Not in stock at the IWD store'], ['4 days ago', 'Purchase request sent to Estate & Works'], ['2 days ago', 'ElectroServe quoted ₹8,400. Waiting for approval.']]
  return (
    <Page back title={`${r.room} · ${r.item}`} sub={`Blocked ${ageDays(r.blockedSince || r.at)} days · Block ${r.block} · ${r.blockedWhy}`}>
      <div className="grid grid-cols-[1fr_380px] gap-12">
        <ol className="relative ml-3 border-l border-line pl-8">
          {story.map(([d, t], i) => (
            <Rise key={t} delay={i * 0.06} className="relative mb-6 last:mb-0">
              <span className={cx('absolute -left-[39px] top-1 flex h-3.5 w-3.5 rounded-full border-[1.5px]', i === story.length - 1 ? 'border-brick bg-brick' : 'border-navy bg-paper')} />
              <div className="font-mono text-[13px] text-mid">{d}</div><div className={cx('text-[15px]', i === story.length - 1 && 'font-semibold')}>{t}</div>
            </Rise>
          ))}
          <Rise delay={0.4} className="mt-6 text-[14px] text-mid">Students in Block {r.block} have been told: waiting on a part.</Rise>
        </ol>
        <div>
          <H2>Needs you</H2>
          <Sticky who="Next step">Approve the purchase, or call the vendor to move it faster.</Sticky>
          <div className="mt-5 flex flex-wrap gap-3"><Button variant="primary" size="md" full={false} icon={<ShieldAlert size={17} />} onClick={() => setEsc(true)}>Escalate</Button><Button variant="secondary" size="md" full={false} icon={<Phone size={18} />} onClick={() => toast({ kind: 'bar', title: 'Calling ElectroServe…', body: '+91 1332 27••••' })}>Call vendor</Button></div>
        </div>
      </div>
      <Dialog open={esc} onClose={() => setEsc(false)} title={`Escalate ${r.room}?`}
        footer={<><Button variant="primary" size="md" full={false} icon={<Send size={18} />} onClick={() => { setEsc(false); fx.success(); toast({ kind: 'bar', title: `Escalated to the ${to.toLowerCase()}`, body: 'Quote and timeline attached', icon: <ShieldAlert size={18} /> }) }}>Escalate</Button><Button variant="secondary" size="md" full={false} onClick={() => setEsc(false)}>Cancel</Button></>}>
        <p className="text-[16px] text-mid">They get a message with the quote and the timeline. You stay on the job.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">{['Warden', 'Estate office'].map(x => <Choice key={x} tone="canal" layout="row" on={to === x} onClick={() => setTo(x)} title={x} sub={x === 'Warden' ? 'Prof. in charge, Himalaya' : 'Estate & Works, IWD'} />)}</div>
        <TextArea className="mt-4" label="Add a line for them (optional)" value={line} onChange={e => setLine(e.target.value)} placeholder="The pump serves 120 students. Two floors have no water pressure." />
      </Dialog>
    </Page>
  )
}

/* ------------------------------ Disputes ------------------------------ */
export function Disputes() {
  const { nav } = useApp()
  const list = store.use(s => s.reps).filter(r => r.status === 'disputed')
  return (
    <Page title="Disputes" sub="A student and a technician disagree about a closed job. You decide.">
      <div className="flex flex-col gap-4">
        {list.map((r, i) => (
          <Rise key={r.id} delay={i * 0.06}>
            <div className="grid grid-cols-[140px_1fr_1fr_140px] items-center gap-6 rounded-[12px] border border-line bg-paper p-5 shadow-desk">
              <div><div className="font-mono text-[16px] font-medium">{r.room}</div><div className="text-[14px] text-mid">{r.item} · {ageText(r.at)}</div></div>
              <Sticky who={`Student · ${r.student.split(' ')[0]}`}>"{r.studentSays}"</Sticky>
              <Sticky tone="sky" who={techName(r.tech)}>"{r.techSays}"</Sticky>
              <Button variant={i === 0 ? 'primary' : 'secondary'} size="md" iconRight={<ArrowRight size={16} />} onClick={() => nav.go('disputeOne', { tr: 'swap', p: { id: r.id } })}>Decide</Button>
            </div>
          </Rise>
        ))}
        {!list.length && <div className="flex flex-col items-center py-16 text-center"><Mark tone="green"><CircleCheck size={26} /></Mark><p className="mt-3 text-[16px] text-mid">No disputes right now.</p></div>}
      </div>
    </Page>
  )
}

export function DisputeOne() {
  const { nav, toast } = useApp()
  const reps = store.use(s => s.reps)
  const r = reps.find(x => x.id === nav.params.id) || reps.find(x => x.status === 'disputed') || reps[0]
  const [re, setRe] = useState(false); const [tech, setTech] = useState(TEAM.find(t => t.trade === r.trade && t.id !== r.tech)?.id || 't4')
  const decide = (status: Rep['status'], msg: string) => { setRep(r.id, { status }); fx.success(); toast({ kind: 'bar', title: msg, icon: <CircleCheck size={20} /> }); nav.reset('disputes', { tr: 'swap' }) }
  return (
    <Page back title={`${r.room} · ${r.item}`} sub={`The student says it is not fixed. ${techName(r.tech).split(' ')[0]} says it is.`}>
      <div className="grid grid-cols-[1fr_1fr_280px] gap-8">
        <div><H2>Student says</H2><Sticky who={r.student}>"{r.studentSays}"</Sticky><div className="mt-5"><Photo n={r.photo || 'photo-chair'} cap="sent after the closure" w={280} /></div></div>
        <div><H2>{techName(r.tech).split(' ')[0]} says</H2><Sticky tone="sky" who={techName(r.tech)}>"{r.techSays}"</Sticky><div className="mt-5"><Photo n={r.item === 'Chair' ? 'photo-chair-after' : 'photo-fan'} cap="after photo · 8:41 PM" w={280} /></div></div>
        <div>
          <H2>Your call</H2>
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="md" icon={<RotateCcw size={17} />} onClick={() => decide('assigned', `${r.room} reopened`)}>Reopen the job</Button>
            <Button variant="secondary" size="md" icon={<Users size={18} />} onClick={() => setRe(true)}>Send someone else</Button>
            <Button variant="secondary" size="md" icon={<CheckIcon size={18} />} onClick={() => decide('closed', 'Closure upheld · student told why')}>Uphold the closure</Button>
          </div>
          <p className="mt-4 text-[13px] text-mid">The student's photo came 3 hours after the closure.</p>
        </div>
      </div>
      <Dialog open={re} onClose={() => setRe(false)} title={`Who should go to ${r.room}?`}
        footer={<><Button variant="primary" size="md" full={false} onClick={() => { setRe(false); decide('assigned', `${r.room} reassigned to ${techName(tech)}`) }}>Reassign</Button><Button variant="secondary" size="md" full={false} onClick={() => setRe(false)}>Cancel</Button></>}>
        <p className="text-[16px] text-mid">The student is told a new person is coming.</p>
        <div className="mt-4 flex flex-col gap-2.5">{TEAM.filter(t => t.on).map(t => <Choice key={t.id} tone="canal" layout="row" on={tech === t.id} onClick={() => setTech(t.id)} title={t.name} sub={`${t.trade} · ${t.today} jobs today · free from ${t.today > 3 ? '9:00' : '7:30'} PM`} />)}</div>
      </Dialog>
    </Page>
  )
}

/* ------------------------------ Fixtures ------------------------------ */
export function Fixtures() {
  const { nav } = useApp()
  return (
    <Page title="Repeat fixtures" sub="Things that keep breaking, most worrying first. Fixing the cause saves trips.">
      <div className="overflow-hidden rounded-[12px] border border-line bg-paper shadow-desk">
        {FIXTURES.map((f, i) => (
          <Rise key={f.id} delay={i * 0.04}>
            <button onClick={() => { fx.tap(); nav.go('fixtureOne', { tr: 'swap', p: { id: f.id } }) }} className="group flex w-full items-center gap-6 border-b border-rule px-6 py-4 text-left hover:bg-cream">
              <span className="w-32 font-mono text-[15px] font-medium">{f.room}</span>
              <span className="flex-1"><span className="block text-[15px] font-semibold">{f.item}</span><span className="text-[13px] text-mid">{f.n} repairs in {f.months} months · last {f.last}</span></span>
              <span className="flex gap-1.5">{Array.from({ length: f.n }, (_, k) => <Dot key={k} size={14} tone={f.worth ? 'brick' : 'navy'} />)}</span>
              {f.worth ? <Tag tone="danger">Worth replacing?</Tag> : <span className="w-[130px]" />}
              <ChevronRight className="text-faint transition-transform group-hover:translate-x-1" />
            </button>
          </Rise>
        ))}
      </div>
    </Page>
  )
}
export function FixtureOne() {
  const { nav, toast } = useApp()
  const f = FIXTURES.find(x => x.id === nav.params.id) || FIXTURES[0]
  return (
    <Page back title={`${f.room} · ${f.item}`} sub={`${f.n} repairs in ${f.months} months`}>
      <div className="grid grid-cols-[1fr_380px] gap-12">
        <ol className="relative ml-3 border-l border-line pl-8">{f.log.map(([d, t, w], i) => <Rise key={d} delay={i * 0.06} className="relative mb-6"><span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-[1.5px] border-navy bg-sun" /><div className="font-mono text-[13px] text-mid">{d}</div><div className="text-[15px] font-semibold">{t}</div><div className="text-[14px] text-mid">by {w}</div></Rise>)}</ol>
        <div>
          <Sticky who="Pattern spotted">The same part failed {f.n - 1} times in {f.months} months. The {f.item.toLowerCase()} itself may be the problem.</Sticky>
          <div className="mt-5 flex gap-3"><Button variant="primary" size="md" full={false} icon={<Wrench size={17} />} onClick={() => toast({ kind: 'bar', title: 'Replacement suggested to Estate & Works', icon: <CircleCheck size={20} /> })}>Suggest replacing it</Button><Button variant="ghost" size="md" full={false}>Keep watching</Button></div>
        </div>
      </div>
    </Page>
  )
}

/* ------------------------------ Team ------------------------------ */
export function Team() {
  const { nav } = useApp()
  const hours = [17, 18, 19, 20, 21, 22]
  return (
    <Page title="Team" sub="Your technicians on tonight's shift, 5 PM to 10 PM. Click a name for their day." right={<Button variant="secondary" size="sm" full={false} icon={<SlidersIcon />} onClick={() => nav.go('rules', { tr: 'swap' })}>Rules</Button>}>
      <div className="rounded-[12px] border border-line bg-paper p-6 shadow-desk">
        <div className="ml-[220px] grid grid-cols-6 border-b border-rule pb-2 text-[12px] font-medium text-mid">{hours.map(h => <span key={h}>{h - 12} PM</span>)}</div>
        {TEAM.map((t, i) => (
          <Rise key={t.id} delay={i * 0.05}>
            <button onClick={() => { fx.tap(); nav.go('tech', { tr: 'swap', p: { id: t.id } }) }} className="group mt-3 flex w-full items-center text-left">
              <span className="flex w-[220px] items-center gap-3"><Avatar name={t.name} size={40} tone={t.on ? 'sky' : 'sand'} /><span><span className="block text-[15px] font-semibold group-hover:underline">{t.name}</span><span className="text-[13px] text-mid">{t.trade} · {t.on ? `${t.today}/${t.cap}` : 'off today'}</span></span></span>
              <span className="relative h-10 flex-1 rounded-[8px] bg-[repeating-linear-gradient(90deg,#F6F0E3_0,#F6F0E3_calc(100%/6_-_1px),#ECE6D9_calc(100%/6_-_1px),#ECE6D9_calc(100%/6))]">
                {t.jobs.map(([s, d, room], k) => (
                  <div key={k} className="absolute top-1.5 bottom-1.5" style={{ left: `${((s - 17) / 6) * 100}%`, width: `max(${(d / 6) * 100}%, 58px)` }}>
                    <Tooltip label={`${room} · ${Math.floor(s - 12)}:${s % 1 ? '30' : '00'} PM`} className="h-full w-full">
                      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...spring, delay: 0.2 + i * 0.05 + k * 0.04 }} className="block h-full w-full origin-left truncate rounded-[6px] border border-canal/30 bg-canal2 px-2 font-mono text-[12px] leading-[26px] text-canal">{room}</motion.span>
                    </Tooltip>
                  </div>
                ))}
              </span>
            </button>
          </Rise>
        ))}
      </div>
    </Page>
  )
}
const SlidersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>

export function Tech() {
  const { nav } = useApp()
  const t = TEAM.find(x => x.id === nav.params.id) || TEAM[0]
  const jobs = store.use(s => s.reps).filter(r => r.tech === t.id)
  return (
    <Page back title={t.name} sub={`${t.trade} · IWD · Blocks ${t.blocks}`} right={<div className="flex items-center gap-3"><Stars value={Math.round(t.rating)} size={22} /><span className="font-head text-[22px] font-bold tabular">{t.rating}</span></div>}>
      <KpiStrip cols={3}><Kpi i={0} n={t.today} label="Jobs tonight" sub={`of ${t.cap} he can do`} /><Kpi i={1} n={jobs.filter(r => r.status === 'closed' || r.status === 'closure').length + 18} label="Closed this month" sub="94% with the student's code" tone="green" /><Kpi i={2} n={jobs.filter(r => r.status === 'disputed').length} label="Open disputes" sub="Reopened by students" tone="brick" /></KpiStrip>
      <H2 className="mt-10">His jobs in Himalaya</H2>
      <div className="flex flex-col">{jobs.map(r => <div key={r.id} className="flex items-center gap-5 border-b border-rule py-3 text-[15px]"><span className="w-28 font-mono text-[14px]">{r.room}</span><span className="flex-1">{r.item} · {r.issue.toLowerCase()}</span><Tag tone={r.status === 'blocked' || r.status === 'disputed' ? 'danger' : r.status === 'closure' ? 'info' : 'neutral'}>{r.status}</Tag></div>)}</div>
    </Page>
  )
}

/* ------------------------------ Rules ------------------------------ */
export function Rules() {
  const { toast } = useApp()
  const s = store.use(x => x)
  const Step = ({ label, value, set, unit, min = 1, max = 10 }: { label: string; value: number; set: (n: number) => void; unit: string; min?: number; max?: number }) => (
    <div className="flex items-center justify-between gap-6 border-b border-rule py-4">
      <span className="text-[15px]">{label}</span>
      <span className="flex items-center gap-2">
        <Button size="sm" variant="secondary" full={false} aria-label="Less" onClick={() => set(Math.max(min, value - 1))}>−</Button>
        <span className="w-28 text-center text-[16px] font-semibold tabular">{value} {unit}{value === 1 ? '' : 's'}</span>
        <Button size="sm" variant="secondary" full={false} aria-label="More" onClick={() => set(Math.min(max, value + 1))}>+</Button>
      </span>
    </div>
  )
  return (
    <Page back title="Rules" sub="How the desk behaves for Himalaya Bhawan. Students see these promises.">
      <div className="max-w-[760px] rounded-[12px] border border-line bg-paper px-6 shadow-desk">
        <Step label="Promise to fix a normal report within" value={s.promise} set={n => store.set({ promise: n })} unit="day" />
        <Step label="Escalate to the warden when blocked for" value={s.autoEscalate} set={n => store.set({ autoEscalate: n })} unit="day" />
        <Step label="After this many missed visits, fix a slot and the warden opens" value={s.missedRule} set={n => store.set({ missedRule: n })} unit="visit" max={4} />
        <div className="py-5"><Toggle tone="canal" on={s.quietFrom === '9:00 PM'} onChange={v => store.set({ quietFrom: v ? '9:00 PM' : 'none' })} label="No visits after 9 PM" sub="Except dangerous reports" /></div>
      </div>
      <div className="mt-6"><Button variant="primary" size="md" full={false} onClick={() => { fx.success(); toast({ kind: 'bar', title: 'Rules saved', body: 'Students see the new promise right away', icon: <CircleCheck size={20} /> }) }}>Save rules</Button></div>
    </Page>
  )
}

/* ------------------------------ Errors ------------------------------ */
export function ErrorPage({ kind }: { kind: 'e404' | 'eOffline' | 'e500' | 'expired' }) {
  const { nav } = useApp()
  const E = {
    e404: ['think', 'We cannot find that page', 'The request may have been merged or closed.', 'Back to home', () => nav.reset('home', { tr: 'swap' })],
    eOffline: ['sit', 'No connection', 'Your changes are saved here and will send when you are back online.', 'Try again', () => nav.back({ tr: 'swap' })],
    e500: ['think', 'That was on us', 'Something broke on our side. Nothing you did is lost.', 'Try again', () => nav.back({ tr: 'swap' })],
    expired: ['point', 'Please sign in again', 'For safety the desk signs out after 8 hours.', 'Sign in', () => nav.reset('login', { tr: 'swap' })],
  }[kind] as ['think' | 'sit' | 'point', string, string, string, () => void]
  return (
    <div className="flex h-full flex-col items-center justify-center bg-cream text-center">
      <div className="font-mono text-[13px] tracking-[0.12em] text-faint">{{ e404: 'ERROR 404', eOffline: 'OFFLINE', e500: 'ERROR 500', expired: 'SESSION ENDED' }[kind]}</div>
      <span className="mt-4"><Mark tone={kind === 'expired' ? 'canal' : kind === 'eOffline' ? 'sun' : 'brick'}>{{ e404: <Search size={24} />, eOffline: <WifiOff size={24} />, e500: <AlertTriangle size={24} />, expired: <Lock size={24} /> }[kind]}</Mark></span>
      <h1 className="mt-5 font-head text-[30px] font-bold">{E[1]}</h1>
      <p className="mt-2 max-w-[420px] text-[16px] text-mid">{E[2]}</p>
      <div className="mt-7 flex gap-3"><Button variant="primary" size="md" full={false} onClick={E[4]}>{E[3]}</Button>{kind === 'e500' && <Button variant="secondary" size="md" full={false} onClick={() => nav.reset('home', { tr: 'swap' })}>Go home</Button>}</div>
    </div>
  )
}
export { Undo2, KeyRound, Users, CalendarDays, TrendingUp, OctagonAlert, Flag, X, Divider, Pop, useEffect, useMemo, dayTime }
