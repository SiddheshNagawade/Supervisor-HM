import { ReactNode, useEffect, useState } from 'react'
import { Transition, useStack } from '../components/nav'
import { Art, ArtBox, Beaver, ErrorPage, Input, Pill } from '../components/ui'
import { listRequests, setStatus, Req } from '../lib'

type S = 'login' | 'home' | 'check' | 'review' | 'closure' | 'forecast' | 'blocked' | 'blockedOne' | 'disputes' | 'disputeOne' | 'fixtures' | 'fixtureOne' | 'team' | 'tech' | 'rules'
  | 'e404' | 'eOffline' | 'e500' | 'expired'
type Nav = ReturnType<typeof useStack<S>>

const RAIL: [S, string, string][] = [['home', 'Home', 'rail-home'], ['check', 'To check', 'rail-check'], ['forecast', 'Load forecast', 'rail-forecast'],
  ['blocked', 'Blocked', 'rail-blocked'], ['disputes', 'Disputes', 'rail-disputes'], ['fixtures', 'Fixtures', 'rail-fixtures'], ['team', 'Team', 'rail-team']]
const GROUP: Partial<Record<S, S>> = { review: 'check', closure: 'check', blockedOne: 'blocked', disputeOne: 'disputes', fixtureOne: 'fixtures', tech: 'team', rules: 'team' }

/* Icons are the Figma SVGs, recoloured with a mask so they turn navy when selected */
const RailIcon = ({ n, on }: { n: string; on: boolean }) => (
  <span className="block w-[30px] h-[30px]" style={{ background: on ? '#00224E' : '#FFFBF3', WebkitMask: `url(/art/${n}.svg) center/contain no-repeat`, mask: `url(/art/${n}.svg) center/contain no-repeat` }} />
)
const Rail = ({ s, nav }: { s: S; nav: Nav }) => (
  <nav className="w-[88px] bg-navy flex flex-col items-center pt-5 shrink-0">
    <button onClick={() => nav.reset('home')} aria-label="ALIGN" className="w-11 h-11 rounded-[12px] bg-cream text-navy font-head font-extrabold text-[24px] mb-[24px]">A</button>
    {RAIL.map(([k, l, n]) => { const on = (GROUP[s] || s) === k; return (
      <button key={k} title={l} aria-label={l} onClick={() => nav.reset(k)} className={`w-16 h-[50px] mb-[18px] rounded-[12px] flex items-center justify-center ${on ? 'bg-cream' : ''}`}><RailIcon n={n} on={on} /></button>) })}
    <button onClick={() => nav.reset('login')} title="Sign out" className="mt-auto mb-[18px] w-[46px] h-[46px] rounded-full bg-sky text-navy border-2 border-cream font-head font-extrabold text-[16px]">M</button>
  </nav>
)

const Page = ({ s, nav, title, sub, right, children, banner, back }: { s: S; nav: Nav; title: string; sub?: string; right?: ReactNode; children: ReactNode; banner?: ReactNode; back?: boolean }) => (
  <div className="h-full flex bg-cream"><Rail s={s} nav={nav} />
    <main className="flex-1 min-w-0 flex flex-col overflow-hidden">{banner}
      <div className="px-[52px] pt-9 pb-3 flex items-start justify-between gap-4 shrink-0"><div>
        {back && <button onClick={nav.back} className="text-[12px] text-mid underline mb-1 block">← Back</button>}
        <h1 className="font-head font-extrabold text-[34px] leading-tight">{title}</h1>{sub && <p className="text-[14px] text-mid mt-1">{sub}</p>}</div>{right}</div>
      <div className="flex-1 min-h-0 overflow-y-auto px-[52px] pb-8">{children}</div></main></div>
)

const Photo = ({ n, cap }: { n: string; cap?: string }) => <figure className="m-0"><Art n={n} w={330} />{cap && <figcaption className="text-[12.5px] text-mid -mt-8 ml-8 relative">{cap}</figcaption>}</figure>
const SLIPS: Record<string, string> = { sun2: 'slip-student', sky: 'slip-tech', cream: 'slip-note' }
const Note = ({ children, tone = 'cream', className = '', h = 120 }: { children: ReactNode; tone?: 'sun2' | 'sky' | 'cream'; className?: string; h?: number }) => (
  <ArtBox n={SLIPS[tone]} className={className} style={{ minHeight: h, width: '100%' }}><div className="px-[26px] pt-[30px] pb-5 text-[14px]">{children}</div></ArtBox>
)
const Paper = ({ children, className = '' }: { children: ReactNode; className?: string; tone?: string; tape?: boolean }) => <div className={`border-[2.5px] border-navy rounded-[14px] bg-cream shadow-[0_3px_0_#00224E] ${className}`}>{children}</div>
const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <div className="absolute inset-0 bg-navy/55 flex items-center justify-center z-20" onClick={onClose}><div onClick={e => e.stopPropagation()}><Paper className="p-6 w-[460px]" tone="cream">{children}</Paper></div></div>
)
const Dot = ({ c = 'bg-navy', ring }: { c?: string; ring?: boolean }) => <span className={`inline-block w-3 h-3 rounded-full ${ring ? 'border-2 border-ember bg-cream' : c}`} />

const TECHS = [['Ravi', 2], ['Imran', 3], ['Deepak', 1]] as const

export default function App() {
  const nav = useStack<S>((new URLSearchParams(location.search).get('s') as S) || 'login')
  const [reqs, setReqs] = useState<Req[]>([])
  const [online, setOnline] = useState(navigator.onLine)
  const [sel, setSel] = useState<Req | null>(null)
  const [modal, setModal] = useState<'merge' | 'escalate' | 'reassign' | null>(null)
  const [tech, setTech] = useState('Ravi'); const [tab, setTab] = useState<'new' | 'closures'>('new')
  const [closure, setClosure] = useState(0); const [rules, setRules] = useState(['3 days', 'me', '5 days', 'the warden', 'twice', 'pick a new time', 'evening at 9'])
  const refresh = () => listRequests().then(setReqs).catch(() => nav.go('e500'))
  useEffect(() => { refresh() }, [])
  useEffect(() => { const u = () => setOnline(true), d = () => setOnline(false); addEventListener('online', u); addEventListener('offline', d); return () => { removeEventListener('online', u); removeEventListener('offline', d) } }, [])
  const s = nav.screen
  const P = (p: Omit<Parameters<typeof Page>[0], 's' | 'nav'>) => <Page s={s} nav={nav} banner={!online && <div className="bg-sun text-center text-[12px] font-head font-bold py-1.5">No connection - changes are paused until you're back online</div>} {...p} />
  const open = reqs.filter(r => r.status === 'reported')
  const BLOCKS = [['Block C', 12, 2], ['Block A', 9, 1], ['Block D', 7, 0], ['Block B', 5, 0]] as const
  const WAIT = [[7, 5, 4, 4], [5, 3, 3, 2], [4, 2, 2, 1], [4, 2, 1, 1]]

  const view: Record<S, ReactNode> = {
    login: (
      <div className="h-full flex overflow-hidden"><div className="w-[46%] bg-navy text-cream p-10 flex flex-col relative"><div className="font-head font-extrabold text-[28px] tracking-[.12em]">ALIGN</div>
        <div className="flex items-end gap-4 mt-auto mb-10">{[7, 6, 4, 3].map((n, i) => <div key={i} className="flex flex-col-reverse gap-1.5">{Array.from({ length: n }, (_, k) => <span key={k} className={`w-3 h-3 rounded-full ${i === 3 && k === 2 ? 'bg-sun' : 'bg-cream'}`} />)}</div>)}</div>
        <h2 className="font-head font-extrabold text-[24px]">Every request, counted and visible.</h2><p className="text-[12.5px] mt-2 opacity-80">The desk for the people who keep a hostel running.</p></div>
        <form className="flex-1 flex flex-col justify-center px-[12%]" onSubmit={e => { e.preventDefault(); nav.reset('home') }}>
          <h1 className="font-head font-extrabold text-[34px]">Sign in</h1><p className="text-[12px] text-mid mb-6">Supervisor desk - Himalya Bhawan</p>
          <div className="space-y-4 max-w-[340px]"><Input label="Work email" defaultValue="meera@iitx.ac.in" type="email" /><Input label="Password" type="password" defaultValue="password1" /></div>
          <div className="flex items-center gap-4 mt-6"><Pill type="submit">Sign in</Pill><button type="button" className="text-[12px] underline">Forgot password</button></div></form></div>),
    home: <P title="Good evening, Meera." sub="Three things need you. Everything else is moving: 33 open, 4 technicians on shift." right={<Pill variant="secondary">Himalya Bhawan - all blocks ▾</Pill>}>
      <div className="grid grid-cols-[1fr_320px] gap-10 mt-2"><div>
        <h2 className="font-head font-extrabold text-[14px]">Every open request, by how long it has waited</h2>
        <div className="flex items-end gap-10 mt-4 h-[190px] border-b-2 border-navy relative pl-4">{['today', '1d', '2d', '3d', '4d', '5d', '6d', '7d+'].map((l, i) => { const n = [7, 5, 4, 4, 3, 2, 3, 1][i]; return <div key={l} className="flex flex-col-reverse gap-1.5 items-center w-8 relative">{Array.from({ length: n }, (_, k) => <Dot key={k} ring={i >= 4} c={i === 6 && k === 1 ? 'bg-ember' : 'bg-navy'} />)}<span className="absolute -bottom-6 text-[11px] text-mid font-mono">{l}</span></div> })}
          <span className="absolute left-[calc(1rem+4*72px-14px)] top-0 bottom-0 border-l border-dashed border-navy text-[10px] pl-1 text-mid">promised: 3 days</span></div>
        <div className="flex gap-5 mt-10 text-[11px] text-mid"><span><Dot /> waiting</span><span><Dot ring /> past the promise</span><span><Dot c="bg-ember" /> blocked</span></div>
        <h2 className="font-head font-extrabold text-[14px] mt-6">Where it is piling up</h2>
        {BLOCKS.map(([b, n, x]) => <button key={b} onClick={() => nav.go('check')} className="w-full flex items-center gap-4 border-t-2 border-navy py-2.5 text-left"><span className="font-head font-extrabold w-16 text-[13px]">{b}</span><span className="flex gap-1 w-[200px]">{Array.from({ length: n }, (_, k) => <Dot key={k} />)}</span><span className="font-mono text-[11px] text-ember flex-1">{n} open{x ? ` · ${x} blocked` : ''}</span><span>›</span></button>)}</div>
        <aside><h2 className="font-head font-extrabold text-[19px] border-b-2 border-navy pb-2">Needs you</h2>
          {[['Motor unit, room 340', 'Blocked 6 days. The part is not in stock and the purchase is not approved.', <><Pill onClick={() => nav.go('blockedOne')}>Escalate</Pill><Pill variant="secondary" onClick={() => { setModal('reassign'); nav.go('disputeOne') }}>Reassign</Pill></>],
            ['Six closures to check', 'The oldest is from yesterday, room BG11. All were closed with the student\'s code.', <Pill variant="secondary" onClick={() => { setTab('closures'); nav.go('check') }}>Review all</Pill>],
            ['Chair, room B305', 'The student says it is not fixed and added a photo.', <Pill variant="secondary" onClick={() => nav.go('disputeOne')}>Open</Pill>]].map(([t, b, a], i) => (
            <div key={i} className="py-4 border-b border-navy/30"><div className="flex gap-2 font-head font-extrabold text-[14px]"><span className="w-5 h-5 rounded-full bg-royal text-cream text-[11px] flex items-center justify-center">{i + 1}</span>{t as string}</div><p className="text-[12px] text-mid mt-1">{b as string}</p><div className="flex gap-2 mt-2">{a as ReactNode}</div></div>))}</aside></div></P>,
    check: <P title="To check" sub="Reports and closures wait here until you say yes." right={<span className="text-[11px] text-mid">oldest first, so nothing hides</span>}>
      <div className="flex gap-6 border-b border-navy/30 mb-2">{([['new', `New reports ${open.length}`], ['closures', 'Closures 6']] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`pb-2 font-head font-bold text-[13px] ${tab === k ? 'border-b-[3px] border-sun' : 'text-mid'}`}>{l}</button>)}</div>
      {tab === 'new' ? open.map((r, i) => <div key={r.id} className="flex items-center gap-4 py-4 border-b-2 border-navy"><Dot ring={i > 2} c={i === 5 ? 'bg-ember' : 'bg-navy'} /><span className="font-mono w-16">{r.room}</span><div className="flex-1"><div className="font-head font-extrabold text-[14px]">{r.fixture}</div><div className="text-[11px] text-mid">{r.block} - {r.photo ? 'note + photo' : 'no photo'}</div></div><span className={`font-mono text-[11px] ${/d ago/.test(r.age) && parseInt(r.age) >= 4 ? 'text-ember' : ''}`}>{r.age}</span><Pill variant={i === 0 ? 'primary' : 'secondary'} onClick={() => { setSel(r); nav.go('review') }}>Review</Pill></div>)
        : ['BG11', '203', 'F7', 'C310', 'D112', 'A205'].map((r, i) => <div key={r} className="flex items-center gap-4 py-4 border-b-2 border-navy"><Dot /><span className="font-mono w-16">{r}</span><div className="flex-1 font-head font-extrabold text-[14px]">{['Fan replacement', 'Tap leaking', 'Router light', 'Tube light', 'Door lock', 'Window latch'][i]} <span className="text-[11px] text-mid font-body">closed with the student's code</span></div><Pill onClick={() => { setClosure(i); nav.go('closure') }}>Review</Pill></div>)}</P>,
    review: <P back title="Review report" sub={`${sel?.room || 'BG04'} - ${sel?.block || 'Block C'} - sent ${sel?.age || '2 hours ago'}`}>
      <div className="grid grid-cols-[230px_1fr] gap-10 mt-4"><div><Photo n="photo-fan" cap={`ceiling fan, ${sel?.room || 'BG04'}`} /><Note className="mt-6" h={150}>"{sel?.note || 'Fan stops after a few minutes. Free after 6 PM.'}"</Note></div>
        <div><h2 className="font-head font-extrabold text-[14px] border-b-2 border-navy pb-1 flex justify-between">Looks like the same problem <span className="font-body text-[10px] text-ember">same fixture, same room</span></h2>
          <ArtBox n="slip-wide" className="mt-3" style={{ height: 140 }}><div className="flex items-center justify-between px-[36px] pt-[40px]"><div><div className="font-head font-extrabold text-[13px]">BG04 - Fan stops after a minute</div><div className="text-[11px] text-mid">Sent 2 days ago by the roommate. Same room, same fan.</div></div><Pill variant="secondary" onClick={() => setModal('merge')}>Merge</Pill></div></ArtBox>
          <h2 className="font-head font-extrabold text-[14px] mt-6">Assign to</h2>
          <div className="flex gap-3 mt-2">{TECHS.map(([n, k]) => <button key={n} onClick={() => setTech(n)} className={`w-[130px] rounded-[12px] border-[2.5px] border-navy p-2 text-left ${tech === n ? 'bg-sun shadow-[0_3px_0_#00224E]' : 'bg-cream'}`}><div className="font-head font-extrabold text-[13px]">{n}</div><div className="flex gap-1 mt-1">{Array.from({ length: k }, (_, i) => <Dot key={i} />)}<span className="text-[10px] ml-1 text-mid">{k} today</span></div></button>)}</div>
          <p className="text-[12px] text-mid mt-4">Promise to the student: fixed within 3 days</p>
          <div className="flex items-center gap-6 mt-6"><Pill onClick={async () => { if (sel) await setStatus(sel.id, 'verified'); await refresh(); nav.back() }}>Accept and assign</Pill><button onClick={async () => { if (sel) await setStatus(sel.id, 'closed'); await refresh(); nav.back() }} className="text-[12px] text-ember underline">Not a real problem</button></div></div></div>
      {modal === 'merge' && <Modal onClose={() => setModal(null)}><h2 className="font-head font-extrabold text-[19px]">Merge these two reports?</h2><p className="text-[12px] mt-2">They become one job for BG04. Both students keep getting updates, and the technician sees one fan to fix.</p>
        <div className="flex items-center gap-3 my-4"><Paper className="p-2 text-[11px] flex-1" tone="cream"><b>Fan not working</b><br />BG04 - today</Paper>→<Paper className="p-2 text-[11px] flex-1" tone="cream"><b>Fan stops after a minute</b><br />BG04 - 2 days ago</Paper></div>
        <div className="flex gap-3"><Pill onClick={async () => { if (sel) await setStatus(sel.id, 'merged'); await refresh(); setModal(null); nav.back() }}>Merge</Pill><Pill variant="secondary" onClick={() => setModal(null)}>Keep separate</Pill></div></Modal>}</P>,
    closure: <P back title="Closure review" sub={`${['BG11', '203', 'F7', 'C310', 'D112', 'A205'][closure]} - Block B - closed yesterday 8:52 PM by Ravi`}>
      <div className="grid grid-cols-[1fr_300px] gap-10 mt-6"><div className="flex gap-6 items-start"><Photo n="photo-fan" cap="before" /><Photo n="photo-fan" cap="after" /></div>
        <div><h2 className="font-head font-extrabold text-[14px] border-b-2 border-navy pb-1">What Ravi did</h2><p className="text-[12px] mt-2">Capacitor replaced. Ran the fan for five minutes.</p>
          {['Closed with the student\'s code', 'Student said: fixed', 'After photo attached'].map(t => <div key={t} className="flex gap-2 items-center mt-3 text-[11.5px] font-head font-bold"><span className="w-4 h-4 rounded-full bg-green text-cream text-[10px] flex items-center justify-center">✓</span>{t}</div>)}
          <div className="flex gap-6 items-center mt-6"><Pill onClick={() => (closure < 5 ? setClosure(closure + 1) : nav.back())}>Accept closure</Pill><button onClick={() => nav.back()} className="text-[12px] text-ember underline">Send back</button></div></div></div>
      <div className="flex items-center gap-3 mt-10 text-[11px] font-mono text-mid">{[0, 1, 2, 3, 4, 5].map(i => <Dot key={i} ring={i === closure} c={i < closure ? 'bg-green' : 'bg-navy'} />)}closure {closure + 1} of 6</div></P>,
    forecast: <P title="Load forecast" sub="The next seven days: work expected against what four technicians can do.">
      <div className="relative h-[260px] mt-6 border-b-2 border-navy flex items-end justify-around"><div className="absolute left-0 right-0 border-t border-dashed border-navy" style={{ bottom: 150 }}><span className="absolute right-0 -top-4 text-[10px] text-mid">what four technicians can do</span></div>
        {[['Sat', 7], ['Sun', 6], ['Mon', 9], ['Tue', 11], ['Wed', 9], ['Thu', 6], ['Fri', 7]].map(([d, n]) => <div key={d as string} className="flex flex-col-reverse gap-1.5 items-center relative">{Array.from({ length: n as number }, (_, k) => <Dot key={k} c={k >= 8 ? 'bg-ember' : 'bg-navy'} />)}<span className="absolute -bottom-6 text-[11px] font-mono text-mid">{d}</span></div>)}</div>
      <div className="flex items-center gap-8 mt-14"><Note className="w-[420px]" h={100}>Tuesday has 4 jobs too many. Moving two to Monday keeps every promise.</Note><Pill>Move two to Monday</Pill><button className="text-[12px] text-ember underline">Leave it</button></div></P>,
    blocked: <P title="Blocked" sub="Jobs that cannot move until something outside the team changes." right={<span className="text-[11px] text-mid">Tap a row to see the whole story</span>}>
      {[['340', 'Motor unit', 'Waiting for purchase approval', '6d'], ['B208', 'Geyser leaks', 'Vendor visit booked Tuesday', '4d'], ['F11', 'Door lock stuck', 'No router tap for this floor', '3d'], ['C102', 'Window glass cracked', 'Part not in stock', '3d']].map(([r, t, w, d], i) => (
        <button key={r} onClick={() => nav.go('blockedOne')} className={`w-full flex items-center gap-4 py-4 border-b-2 border-navy text-left ${i === 0 ? 'rounded-[8px] ring-2 ring-royal px-3' : ''}`}><Dot c="bg-ember" /><span className="font-mono w-14">{r}</span><span className="flex-1"><b className="font-head font-extrabold text-[14px]">{t}</b><br /><span className="text-[11px] text-mid">{w}</span></span><span className="font-head font-extrabold text-[22px] text-ember">{d}</span><span className="text-[11px] text-mid">blocked</span></button>))}</P>,
    blockedOne: <P back title="Room 340 · Motor unit" sub="Blocked 6 days - Block A - water pump motor">
      <div className="grid grid-cols-[1fr_340px] gap-10 mt-4"><div className="border-l-2 border-navy ml-2 pl-6 space-y-6">{[['Sat 25', 'Reported by the student'], ['Sun 26', 'Ravi visited. The motor is burnt out.'], ['Mon 27', 'Part not in stock at the store'], ['Tue 28', 'Purchase request sent to the office'], ['Thu 30', 'ElectroServe quoted ₹ 8,400. Waiting for approval.']].map(([d, t], i) => <div key={d} className="relative"><span className={`absolute -left-[33px] top-1 w-3.5 h-3.5 rounded-full border-2 border-navy ${i === 4 ? 'bg-ember' : 'bg-cream'}`} /><div className="font-mono text-[10.5px] text-mid">{d}</div><div className={`font-head ${i === 4 ? 'font-extrabold' : 'font-bold'} text-[13.5px]`}>{t}</div></div>)}<p className="text-[11px] text-mid">The student has been told: waiting on a part.</p></div>
        <div><h2 className="font-head font-extrabold text-[14px] border-b-2 border-navy pb-1">Needs you</h2><Note className="mt-4">Approve the purchase, or call the vendor to move it faster.</Note>
          <div className="flex gap-2 mt-4"><Pill onClick={() => setModal('escalate')}>Escalate</Pill><Pill variant="secondary">Reassign</Pill></div><Pill variant="secondary" className="mt-2">Call ElectroServe</Pill><p className="text-[11px] text-mid mt-3">Nothing else for you to do on this one.</p></div></div>
      {modal === 'escalate' && <Modal onClose={() => setModal(null)}><h2 className="font-head font-extrabold text-[19px]">Escalate Room 340?</h2><p className="text-[12px] mt-2">The warden gets a message with the quote and the timeline. You stay on the job.</p><div className="flex gap-3 mt-4"><Pill variant="secondary" className="!bg-sun">Warden</Pill><Pill variant="secondary">Estate office</Pill></div><Input className="mt-4" placeholder="Add a line for them" /><div className="flex gap-3 mt-4"><Pill onClick={() => setModal(null)}>Escalate</Pill><Pill variant="secondary" onClick={() => setModal(null)}>Cancel</Pill></div></Modal>}</P>,
    disputes: <P title="Disputes" sub="A student and a technician disagree about a closed job.">
      {[['B305', 'Chair', 'Still wobbly. The leg moves.', 'Ravi', 'Tightened the screw, tested it.', '1d'], ['F2', 'Router', 'Light is still red.', 'Imran', 'Light was green when I left.', '2d'], ['A301', 'Tap', 'It drips again.', 'Deepak', 'Changed the washer, no drip.', '3d']].map(([r, f, a, t, b, d], i) => (
        <div key={r} className="grid grid-cols-[90px_1fr_1fr_90px] gap-5 items-center py-5 border-t-2 border-navy first:mt-6"><div><div className="font-mono font-bold">{r}</div><div className="text-[11px] text-mid">{f}</div></div>
          <Note tone="sun2" h={110}><div className="text-[10px] text-ember">Student</div>"{a}"</Note><Note tone="sky" h={110}><div className="text-[10px] text-mid">{t}</div>"{b}"</Note><div><Pill variant={i === 0 ? 'primary' : 'secondary'} onClick={() => nav.go('disputeOne')}>Open</Pill><div className="text-[10px] text-mid mt-1">{d} open</div></div></div>))}</P>,
    disputeOne: <P back title="B305 · Chair" sub="The student says it is not fixed. Ravi says it is.">
      <div className="grid grid-cols-[1fr_1fr_220px] gap-8 mt-4"><div><h2 className="font-head font-extrabold text-[13px] mb-2">Student says</h2><Note>"Still wobbly. The leg moves."</Note><div className="mt-4"><Photo n="photo-chair" cap="sent after the closure" /></div></div>
        <div><h2 className="font-head font-extrabold text-[13px] mb-2">Ravi says</h2><Note tone="sky">"Tightened the screw, tested it."</Note><div className="mt-4"><Photo n="photo-chair-after" cap="after photo · 8:41 PM" /></div></div>
        <div><h2 className="font-head font-extrabold text-[14px] border-b-2 border-navy pb-1">Your call</h2><div className="flex flex-col gap-3 mt-4 items-start"><Pill>Reopen the job</Pill><Pill variant="secondary" onClick={nav.back}>Uphold the closure</Pill><Pill variant="secondary" onClick={() => setModal('reassign')}>Reassign</Pill></div><p className="text-[11px] text-mid mt-5">The student's photo came 3 hours after the closure.</p></div></div>
      {modal === 'reassign' && <Modal onClose={() => setModal(null)}><h2 className="font-head font-extrabold text-[19px]">Reassign B305?</h2><p className="text-[12px] mt-2">Pick who goes back. The student is told a new person is coming.</p>
        <div className="flex gap-3 mt-4">{TECHS.map(([n, k]) => <button key={n} onClick={() => setTech(n)} className={`flex-1 rounded-[12px] border-[2.5px] border-navy p-2 text-left ${tech === n ? 'bg-sun' : 'bg-cream'}`}><div className="font-head font-extrabold text-[13px]">{n}</div><div className="text-[10px] text-mid">{k} today</div></button>)}</div><p className="text-[11px] text-mid mt-3">Fewest jobs today. Free from 7:30 PM.</p>
        <div className="flex gap-3 mt-4"><Pill onClick={() => { setModal(null); nav.reset('disputes') }}>Reassign</Pill><Pill variant="secondary" onClick={() => setModal(null)}>Cancel</Pill></div></Modal>}</P>,
    fixtures: <P title="Fixtures" sub="Things that keep breaking, in the order that matters.">
      {[['BG04', 'Ceiling fan', 3, 'worth replacing?'], ['B208', 'Geyser', 3, 'worth replacing?'], ['F2', 'Router', 2, ''], ['C102', 'Window latch', 2, ''], ['A301', 'Tap', 2, '']].map(([r, f, n, w], i) => (
        <div key={r as string} className="flex items-center gap-6 py-4 border-b-2 border-navy first:mt-4"><span className="font-mono w-16">{r}</span><div className="flex-1"><b className="font-head font-extrabold text-[14px]">{f}</b><div className="text-[11px] text-mid">{n} repairs in 6 months</div></div><span className="flex gap-1">{Array.from({ length: n as number }, (_, k) => <span key={k} className="w-5 h-5 rounded-full border-2 border-ember text-ember text-[10px] flex items-center justify-center">⟳</span>)}</span><span className="text-[11px] text-ember w-28">{w}</span><Pill variant={i === 0 ? 'primary' : 'secondary'} onClick={() => nav.go('fixtureOne')}>Open</Pill></div>))}</P>,
    fixtureOne: <P back title="BG04 · Ceiling fan" sub="Block C - 3 repairs in 6 months">
      <div className="grid grid-cols-[1fr_340px] gap-10 mt-4"><div className="border-l-2 border-navy ml-2 pl-6 space-y-6">{[['3 weeks ago', 'Capacitor replaced - Ravi'], ['2 months ago', 'Capacitor replaced - Imran'], ['5 months ago', 'Bearing noise, cleaned - Deepak']].map(([d, t], i) => <div key={d} className="relative"><span className={`absolute -left-[33px] top-1 w-3.5 h-3.5 rounded-full border-2 border-navy ${i === 0 ? 'bg-sun' : 'bg-cream'}`} /><div className="font-mono text-[10.5px] text-ember">{d}</div><div className="font-head font-bold text-[13.5px]">{t}</div></div>)}</div>
        <div><Note><b className="font-head">Pattern spotted</b><br />The same part has failed twice in five weeks. The fan itself may be the problem.</Note><div className="flex gap-4 items-center mt-5"><Pill>Suggest replacing the fan</Pill><button className="text-[12px] text-ember underline">Keep watching</button></div></div></div></P>,
    team: <P title="Team" sub="Your technicians on shift. Tap a name for their whole day.">
      <div className="mt-6 relative">{[['Ravi', 'BG, F, C', [[20, 12], [48, 14], [76, 10]]], ['Imran', 'A, B', [[12, 14], [40, 14], [68, 12]]], ['Deepak', 'C, D', [[30, 12], [52, 12], [80, 12]]], ['Sunil', 'A, D', [[24, 14], [58, 14]]]].map(([n, b, jobs]) => (
        <button key={n as string} onClick={() => { setTech(n as string); nav.go('tech') }} className="w-full grid grid-cols-[100px_1fr] items-center py-5 border-b-2 border-navy text-left"><div><div className="font-head font-extrabold text-[14px]">{n as string}</div><div className="text-[10px] text-mid">{b as string}</div></div><div className="relative h-9 border-b border-dashed border-navy/50">{(jobs as number[][]).map(([l, w], i) => <span key={i} className="absolute top-0 h-8 rounded-[8px] border-2 border-navy bg-sun2 text-[9px] font-mono flex items-center justify-center" style={{ left: `${l}%`, width: `${w * 1.6}%` }}>{['F2', 'BG04', 'C209'][i]}</span>)}</div></button>))}
        <div className="absolute top-0 bottom-0 border-l-2 border-royal" style={{ left: 'calc(100px + 48%)' }} /></div>
      <div className="flex items-center gap-4 mt-6"><Pill variant="secondary" onClick={() => nav.go('rules')}>Notification rules</Pill><span className="text-[11px] text-mid">when to ALIGN nudges people</span></div></P>,
    tech: <P back title={tech} sub="Shift 5 to 10 PM - Blocks BG, F, C - Hindi and English">
      <div className="grid grid-cols-[1fr_300px] gap-12 mt-4"><div><h2 className="font-head font-extrabold text-[13px] border-b-2 border-navy pb-1">Today</h2>{[['F2', 'Router light', '6:20 PM', true], ['118', 'Tap drip', '7:00 PM', true], ['BG04', 'Fan stops', '8:30 PM', false], ['C209', 'Window latch', '9:15 PM', false]].map(([r, t, w, d]) => <div key={r as string} className="flex items-center gap-4 py-3 border-b border-navy/30"><span className={`w-4 h-4 rounded-full border-2 border-navy ${d ? 'bg-green' : 'bg-cream'}`} /><span className="font-mono w-14">{r as string}</span><span className="flex-1 text-[12px]">{t as string}</span><span className="font-mono text-[11px]">{w as string}</span></div>)}</div>
        <div><h2 className="font-head font-extrabold text-[13px] border-b-2 border-navy pb-1">This week</h2><div className="flex gap-10 mt-3">{[['21', 'jobs finished'], ['18', 'fixed on the first visit']].map(([n, l]) => <div key={l}><div className="font-head font-extrabold text-[34px] leading-none">{n}</div><div className="text-[10px] text-mid">{l}</div></div>)}</div><div className="mt-4 font-head font-extrabold text-[34px]">38 <span className="text-[14px]">min</span></div><div className="text-[10px] text-mid">average time on a job</div>
          <div className="flex gap-2 mt-5"><Pill variant="secondary">Change blocks</Pill><Pill variant="secondary">Change shift</Pill></div></div></div></P>,
    rules: <P back title="Rules" sub="When ALIGN should nudge people. Tap a highlighted word to change it.">
      <div className="mt-6 max-w-[680px] space-y-6 text-[17px]">{[['If a request waits more than ', 0, ', tell ', 1], ['If a job is blocked for more than ', 2, ', tell ', 3], ['If a student is not home ', 4, ', ask them to ', 5], ['Send me a summary every ', 6, '', -1]].map((r, i) => <p key={i} className="border-b-2 border-navy pb-3 font-head font-bold">{r[0] as string}<mark className="bg-sun px-1.5 rounded border-2 border-navy">{rules[r[1] as number]}</mark>{r[2] as string}{(r[3] as number) >= 0 && <mark className="bg-sun px-1.5 rounded border-2 border-navy">{rules[r[3] as number]}</mark>}.</p>)}</div>
      <div className="flex items-center gap-4 mt-6"><Pill onClick={() => nav.back()}>Save rules</Pill><span className="text-[11px] text-mid">changes take effect today</span></div></P>,
    e404: <Page s="home" nav={nav} title="" ><ErrorPage tone="sup" pose="think" title="We can't find that page." body="The link may be old, or this request was closed or merged into another one." primary={['Back to the desk', () => nav.reset('home')]} secondary={['Go to To check', () => nav.reset('check')]} /></Page>,
    eOffline: <Page s="home" nav={nav} title="" banner={<div className="bg-sun text-center text-[12px] font-head font-bold py-1.5">No connection - changes are paused until you're back online</div>}><ErrorPage tone="sup" pose="sit" title="You're offline." body="ALIGN can't reach the server. What you already loaded is still here and nothing is lost. We reconnect on our own." primary={['Try again', nav.back]} secondary={['View last loaded desk', () => nav.reset('home')]} /></Page>,
    e500: <Page s="home" nav={nav} title=""><ErrorPage tone="sup" pose="think" title="Something broke on our side." body="Your decisions are saved and our team has been told. Try again in a minute." primary={['Try again', () => { refresh(); nav.reset('home') }]} secondary={['Back to the desk', () => nav.reset('home')]} /></Page>,
    expired: <div className="h-full flex overflow-hidden"><div className="w-[46%] bg-navy" /><form className="flex-1 flex flex-col justify-center px-[12%]" onSubmit={e => { e.preventDefault(); nav.reset('home') }}><h1 className="font-head font-extrabold text-[34px]">You were signed out.</h1><p className="text-[12px] text-mid mb-6">Sessions end after 30 minutes away. Sign in to pick up where you left off.</p><div className="space-y-4 max-w-[340px]"><Input label="Work email" defaultValue="meera@iitx.ac.in" /><Input label="Password" type="password" defaultValue="password1" /></div><div className="mt-6"><Pill type="submit">Sign in</Pill></div></form></div>,
  }
  const demo: [string, S][] = [['404', 'e404'], ['offline', 'eOffline'], ['500', 'e500'], ['signed out', 'expired']]
  return (
    <div className="fixed inset-0 bg-cream overflow-hidden">
      <div className="relative w-full h-full min-w-[1100px]">
        <Transition id={s} dir={nav.dir} mode="fade">{view[s]}</Transition>
      </div>
      <div className="fixed bottom-1 right-3 font-mono text-[10px] text-mid flex gap-2 z-30">demo: {demo.map(([l, k]) => <button key={k} className="underline" onClick={() => nav.go(k)}>{l}</button>)}</div>
    </div>
  )
}
void Beaver
