/* Supervisor desk: Meera, Bhawan supervisor, Himalaya Bhawan, IIT Roorkee.
   The words and numbers are the ones on the Figma screens. Everything is local mock data you can act on. */
import { createStore } from '../data/iitr'

export const EMAIL_OK = /^[a-z0-9][a-z0-9._-]*@([a-z0-9-]+\.)?iitr\.ac\.in$/i

/* "To check" list: the six rows in the Figma, in its order (oldest first is the Figma's promise,
   the rows are drawn as the designer laid them out). */
export type Row = { id: string; room: string; block: string; title: string; item: string; sub: string; age: string; late: boolean; dot: 'navy' | 'ring' | 'brick'
  quote: string; photo: 'fan' | 'chair' | null; dup: boolean }
export const ROWS: Row[] = [
  { id: 'r1', room: 'BG04', block: 'C', title: 'Fan not working', item: 'ceiling fan', sub: 'Block C · note + photo', age: '2h ago', late: false, dot: 'navy', quote: '“Fan stops after a few minutes. Free after 2 PM.”', photo: 'fan', dup: true },
  { id: 'r2', room: 'F2', block: 'A', title: 'Router light is red', item: 'router', sub: 'Block A · no photo', age: '5h ago', late: false, dot: 'navy', quote: '“The light has been red since the morning.”', photo: null, dup: false },
  { id: 'r3', room: '118', block: 'D', title: 'Tap leaking under the sink', item: 'tap', sub: 'Block D · photo', age: '1d ago', late: false, dot: 'navy', quote: '“Water collects under the sink by night.”', photo: null, dup: false },
  { id: 'r4', room: 'B305', block: 'B', title: 'Chair broken, leg loose', item: 'chair', sub: 'Block B · photo', age: '4d ago', late: true, dot: 'ring', quote: '“One leg moves when I sit.”', photo: 'chair', dup: false },
  { id: 'r5', room: 'C209', block: 'C', title: 'Window will not latch', item: 'window', sub: 'Block C · note', age: '4d ago', late: true, dot: 'ring', quote: '“Rain comes in at night.”', photo: null, dup: false },
  { id: 'r6', room: '340', block: 'A', title: 'Motor unit noisy', item: 'motor unit', sub: 'Block A · note + photo', age: '6d ago', late: true, dot: 'brick', quote: '“Loud hum from the pump room.”', photo: null, dup: false },
]
export const NEW_ROW: Row = { id: 'r7', room: 'C117', block: 'C', title: 'Geyser not heating', item: 'geyser', sub: 'Block C · note', age: 'just now', late: false, dot: 'navy', quote: '“No hot water since this morning.”', photo: null, dup: false }

export const CLOSURES = [
  { room: 'BG11', block: 'B', when: 'yesterday 4:52 PM', tech: 'Ravi', did: 'Capacitor replaced. Ran the fan for five minutes.' },
  { room: 'C203', block: 'C', when: 'yesterday 3:40 PM', tech: 'Imran', did: 'Changed the washer and the spindle.' },
  { room: 'A205', block: 'A', when: 'yesterday 1:15 PM', tech: 'Deepak', did: 'Replaced both hinges of the almirah.' },
  { room: 'F1', block: 'A', when: 'yesterday 11:30 AM', tech: 'Sunil', did: 'New choke fitted in the corridor light.' },
  { room: 'B111', block: 'B', when: '2 days ago', tech: 'Ravi', did: 'Fixed the loose switchboard.' },
  { room: 'D102', block: 'D', when: '2 days ago', tech: 'Sunil', did: 'Cleaned the clogged drain.' },
]
export const BLOCKED = [
  { room: '340', title: 'Motor unit', why: 'Waiting for purchase approval', days: '6d', sub: 'Blocked 6 days · Block A · water pump motor' },
  { room: 'B208', title: 'Geyser leaks', why: 'Vendor visit booked Tuesday', days: '4d', sub: 'Blocked 4 days · Block B · geyser' },
  { room: 'F11', title: 'Door lock stuck', why: 'No master key for this floor', days: '3d', sub: 'Blocked 3 days · Block F · door lock' },
  { room: 'C102', title: 'Window glass cracked', why: 'Part not in stock', days: '3d', sub: 'Blocked 3 days · Block C · window' },
]
export const DISPUTES = [
  { room: 'B305', item: 'Chair', tech: 'Ravi', student: '“Still wobbly. The leg moves.”', techSays: '“Tightened the screw, tested it.”', open: '1d open' },
  { room: 'F2', item: 'Router', tech: 'Imran', student: '“Light is still red.”', techSays: '“Light was green when I left.”', open: '2d open' },
  { room: 'A301', item: 'Tap', tech: 'Deepak', student: '“It drips again.”', techSays: '“Changed the washer, no drip.”', open: '3d open' },
]
export const FIXTURES = [
  { room: 'BG04', item: 'Ceiling fan', sub: 'Block C · 3 repairs in 5 months' },
  { room: 'B208', item: 'Geyser', sub: 'Block B · 3 repairs in 4 months' },
  { room: 'F2', item: 'Router', sub: 'Block A · 2 repairs in 3 weeks' },
  { room: 'C102', item: 'Window latch', sub: 'Block C · 2 repairs in 2 months' },
  { room: 'A301', item: 'Tap', sub: 'Block A · 2 repairs in 6 weeks' },
]
export const TEAM = [
  { name: 'Ravi', blocks: 'BG, F, C' }, { name: 'Imran', blocks: 'A, B' }, { name: 'Deepak', blocks: 'C, D' }, { name: 'Sunil', blocks: 'D, E' },
]

export type State = {
  signedIn: boolean; email: string; rows: Row[]; closureAt: number; blockedLeft: number[]; disputesLeft: number[]
  escalated: number[]; moved: boolean; leftAlone: boolean; bhawan: number; replaceSuggested: number[]
  rules: number[]; rulesSaved: boolean; shift: number[]; blockSet: number[]
}
export const store = createStore<State>('align.sup.fig.v2', () => ({
  signedIn: false, email: '', rows: ROWS, closureAt: 0, blockedLeft: [0, 1, 2, 3], disputesLeft: [0, 1, 2],
  escalated: [], moved: false, leftAlone: false, bhawan: 0, replaceSuggested: [], rules: [0, 0, 0, 0, 0, 0, 0], rulesSaved: false, shift: [0, 0, 0, 0], blockSet: [0, 0, 0, 0],
}))
