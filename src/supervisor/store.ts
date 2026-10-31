/* Supervisor desk: Meera Joshi, Bhawan supervisor, Himalaya Bhawan (girls), IIT Roorkee.
   Reports come in from students; she checks them, assigns IWD technicians, signs off closures,
   handles blocked jobs, disputes and repeat failures. Everything here is mock data you can act on. */
import { createStore, D, H, Trade } from '../data/iitr'

export type RStatus = 'new' | 'assigned' | 'closure' | 'blocked' | 'disputed' | 'closed' | 'merged' | 'rejected'
export type Rep = {
  id: string; room: string; block: string; item: string; issue: string; trade: Trade; note: string; student: string; at: number
  photo: string | null; status: RStatus; tech?: string; dupOf?: string; urgent?: boolean; shared?: number
  closedBy?: string; fix?: string; blockedWhy?: string; blockedSince?: number; studentSays?: string; techSays?: string
}
export type TechRow = { id: string; name: string; trade: Trade; blocks: string; today: number; cap: number; rating: number; on: boolean; jobs: [number, number, string][] }

const n = Date.now()
const reps = (): Rep[] => [
  { id: '2417', room: 'B-104', block: 'B', item: 'Ceiling fan', issue: 'Not spinning', trade: 'Electrical', note: 'Fan stops after a few minutes. Free after 6 PM.', student: 'Siddhi Sharma', at: n - 2 * H, photo: 'photo-fan', status: 'new', dupOf: '2402' },
  { id: '2416', room: 'C-212', block: 'C', item: 'Tap', issue: 'Leaking', trade: 'Plumbing', note: 'Second tap in the east washroom drips all night.', student: 'Ananya Verma', at: n - 5 * H, photo: null, status: 'new', shared: 3 },
  { id: '2415', room: 'A-018', block: 'A', item: 'Socket', issue: 'Sparks or burning smell', trade: 'Electrical', note: 'Burning smell from the socket near the desk.', student: 'Kavya Nair', at: n - 1 * H, photo: 'photo', status: 'new', urgent: true },
  { id: '2414', room: 'B-305', block: 'B', item: 'Chair', issue: 'Leg loose', trade: 'Carpentry', note: '', student: 'Riya Gupta', at: n - 1 * D, photo: 'photo-chair', status: 'new' },
  { id: '2413', room: 'C-209', block: 'C', item: 'Window', issue: 'Will not latch', trade: 'Carpentry', note: 'Rain comes in.', student: 'Meghna Rao', at: n - 3 * D, photo: null, status: 'new' },
  { id: '2412', room: 'A-110', block: 'A', item: 'Tube light', issue: 'Flickering', trade: 'Electrical', note: '', student: 'Pooja Iyer', at: n - 4 * D, photo: null, status: 'new' },
  { id: '2402', room: 'B-104', block: 'B', item: 'Ceiling fan', issue: 'Stops after a minute', trade: 'Electrical', note: 'Sent by the roommate.', student: 'Tanvi Joshi', at: n - 2 * D, photo: null, status: 'assigned', tech: 't1' },
  // closures waiting for sign-off
  { id: '2398', room: 'B-111', block: 'B', item: 'Ceiling fan', issue: 'Noisy', trade: 'Electrical', note: '', student: 'Shreya Das', at: n - 2 * D, photo: 'photo-fan', status: 'closure', tech: 't1', closedBy: 'code', fix: 'Capacitor replaced. Ran the fan for five minutes at all speeds.' },
  { id: '2396', room: 'C-203', block: 'C', item: 'Tap', issue: 'Leaking', trade: 'Plumbing', note: '', student: 'Ishita Roy', at: n - 3 * D, photo: null, status: 'closure', tech: 't3', closedBy: 'code', fix: 'Changed the washer and the spindle.' },
  { id: '2395', room: 'F1 corridor', block: 'A', item: 'Tube light', issue: 'Not turning on', trade: 'Electrical', note: '', student: '3 students', at: n - 3 * D, photo: null, status: 'closure', tech: 't2', closedBy: 'photo', fix: 'New choke fitted. Photo attached, no code: hallway job.' },
  { id: '2393', room: 'A-205', block: 'A', item: 'Almirah', issue: 'Hinge broken', trade: 'Carpentry', note: '', student: 'Nidhi Bansal', at: n - 4 * D, photo: null, status: 'closure', tech: 't4', closedBy: 'code', fix: 'Replaced both hinges.' },
  // blocked
  { id: '2381', room: 'Pump room', block: 'A', item: 'Water pump motor', issue: 'Burnt out', trade: 'Electrical', note: '', student: 'Warden', at: n - 6 * D, photo: null, status: 'blocked', tech: 't1', blockedWhy: 'Waiting for purchase approval', blockedSince: n - 6 * D },
  { id: '2385', room: 'B-208', block: 'B', item: 'Geyser', issue: 'Leaking', trade: 'Plumbing', note: '', student: 'Aditi Mehra', at: n - 4 * D, photo: null, status: 'blocked', tech: 't3', blockedWhy: 'Vendor visit booked for Tuesday', blockedSince: n - 4 * D },
  { id: '2388', room: 'C-102', block: 'C', item: 'Window', issue: 'Glass cracked', trade: 'Carpentry', note: '', student: 'Sana Khan', at: n - 3 * D, photo: null, status: 'blocked', tech: 't4', blockedWhy: 'Glass not in stock at the IWD store', blockedSince: n - 3 * D },
  // disputes
  { id: '2370', room: 'B-305', block: 'B', item: 'Chair', issue: 'Leg loose', trade: 'Carpentry', note: '', student: 'Riya Gupta', at: n - 8 * D, photo: 'photo-chair', status: 'disputed', tech: 't4', studentSays: 'Still wobbly. The leg moves.', techSays: 'Tightened the screw and tested it.' },
  { id: '2374', room: 'A-301', block: 'A', item: 'Tap', issue: 'Leaking', trade: 'Plumbing', note: '', student: 'Divya Menon', at: n - 6 * D, photo: null, status: 'disputed', tech: 't3', studentSays: 'It drips again since this morning.', techSays: 'Changed the washer. No drip when I left.' },
]
export const TEAM: TechRow[] = [
  { id: 't1', name: 'Ravi Kumar', trade: 'Electrical', blocks: 'B, C', today: 4, cap: 6, rating: 4.8, on: true, jobs: [[17, 0.5, 'C-214'], [18, 0.5, 'B-104'], [18.5, 0.5, 'F1'], [19.5, 0.5, 'A-012']] },
  { id: 't2', name: 'Suresh Pal', trade: 'Electrical', blocks: 'A', today: 3, cap: 6, rating: 4.6, on: true, jobs: [[17.5, 0.5, 'A-110'], [19, 1, 'A-018'], [20.5, 0.5, 'A-121']] },
  { id: 't3', name: 'Imran Ali', trade: 'Plumbing', blocks: 'All', today: 5, cap: 5, rating: 4.7, on: true, jobs: [[17, 0.5, 'C-212'], [17.5, 0.5, 'C-203'], [18.5, 1, 'B-208'], [20, 0.5, 'A-301'], [21, 0.5, 'B-014']] },
  { id: 't4', name: 'Deepak Saini', trade: 'Carpentry', blocks: 'All', today: 2, cap: 6, rating: 4.9, on: true, jobs: [[18, 1, 'B-305'], [20, 0.5, 'C-209']] },
  { id: 't5', name: 'Mahesh Chauhan', trade: 'Civil', blocks: 'All', today: 0, cap: 4, rating: 4.5, on: false, jobs: [] },
]
export const techName = (id?: string) => TEAM.find(t => t.id === id)?.name || 'Unassigned'
export const FIXTURES = [
  { id: 'f1', room: 'B-104', item: 'Ceiling fan', n: 3, months: 5, last: '3 weeks ago', worth: true, log: [['3 weeks ago', 'Capacitor replaced', 'Ravi'], ['2 months ago', 'Capacitor replaced', 'Suresh'], ['5 months ago', 'Bearing noise, cleaned', 'Ravi']] },
  { id: 'f2', room: 'B-208', item: 'Geyser', n: 3, months: 6, last: 'now', worth: true, log: [['4 days ago', 'Leaking, vendor called', 'Imran'], ['3 months ago', 'Thermostat replaced', 'Suresh'], ['6 months ago', 'Pressure valve', 'Imran']] },
  { id: 'f3', room: 'C-209', item: 'Window latch', n: 2, months: 4, last: '3 days ago', worth: false, log: [['3 days ago', 'Will not latch', 'Deepak'], ['4 months ago', 'Latch tightened', 'Deepak']] },
  { id: 'f4', room: 'A-301', item: 'Tap', n: 2, months: 3, last: '6 days ago', worth: false, log: [['6 days ago', 'Washer changed', 'Imran'], ['3 months ago', 'Washer changed', 'Imran']] },
  { id: 'f5', room: 'F1 corridor', item: 'Tube light', n: 2, months: 2, last: '3 days ago', worth: false, log: [['3 days ago', 'Choke replaced', 'Suresh'], ['2 months ago', 'Tube replaced', 'Suresh']] },
]
export type State = {
  signedIn: boolean; reps: Rep[]; bhawan: string; promise: number; autoEscalate: number; missedRule: number; quietFrom: string; forecastMoved: boolean
}
export const store = createStore<State>('align.sup.v2', () => ({ signedIn: false, reps: reps(), bhawan: 'All blocks', promise: 3, autoEscalate: 5, missedRule: 2, quietFrom: '9:00 PM', forecastMoved: false }))
export const setRep = (id: string, p: Partial<Rep>) => store.set(s => ({ reps: s.reps.map(r => (r.id === id ? { ...r, ...p } : r)) }))
export const ageDays = (at: number) => Math.floor((Date.now() - at) / D)
export const ageText = (at: number) => { const h = Math.round((Date.now() - at) / H); return h < 24 ? `${Math.max(1, h)}h` : `${Math.round(h / 24)}d` }
