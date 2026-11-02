/* Supervisor desk: Meera, Bhawan supervisor, Himalaya Bhawan, IIT Roorkee.
   The words and numbers are the ones on the Figma screens. Everything is local mock data you can act on. */
import { createStore } from '../data/iitr'

export const EMAIL_OK = /^[a-z0-9][a-z0-9._-]*@([a-z0-9-]+\.)?iitr\.ac\.in$/i

/* "To check" list: the six rows in the Figma, in its order (oldest first is the Figma's promise,
   the rows are drawn as the designer laid them out). */
/** Where a problem is. A student's own room is the only "Room"; everything shared is named for what it is. */
export type Place = 'Room' | 'Corridor' | 'Washroom' | 'Pump room'
export const whereOf = (room: string, place: Place) => (place === 'Room' ? `Room ${room}` : place === 'Pump room' ? 'Pump room' : `${place} ${room}`)
export type Row = { id: string; place: Place; room: string; block: string; title: string; item: string; sub: string; age: string; late: boolean; dot: 'navy' | 'ring' | 'brick'
  quote: string; photo: Photo | null
  /** An older report that looks like the same problem (every report shows one, so every review page has the same parts). */
  sim: { title: string; sub: string; short: string; ago: string } }
/** Real photographs (public/photos/<name>.jpg, credits in CREDITS.txt there). */
export type Photo = 'fan' | 'chair' | 'tap' | 'motor' | 'router' | 'latch' | 'switch' | 'drain' | 'tube' | 'geyser' | 'hinge' | 'door'
export const ROWS: Row[] = [
  { id: 'r1', place: 'Room', room: 'BG04', block: 'C', title: 'Fan not working', item: 'ceiling fan', sub: 'Block C · room · note + photo', age: '2h ago', late: false, dot: 'navy', quote: '“Fan stops after a few minutes. Free after 2 PM.”', photo: 'fan', sim: { title: 'BG04 · Fan stops after a minute', sub: 'Sent 2 days ago by the roommate. Same room, same fan.', short: 'Fan stops after a minute', ago: '2 days ago' } },
  { id: 'r2', place: 'Corridor', room: 'F2', block: 'A', title: 'Router light is red', item: 'router', sub: 'Block A · corridor · note + photo', age: '5h ago', late: false, dot: 'navy', quote: '“The light has been red since the morning.”', photo: 'router', sim: { title: 'F2 · Router light blinks red', sub: 'Sent 3 days ago by a neighbour. Same corridor, same router.', short: 'Router light blinks red', ago: '3 days ago' } },
  { id: 'r3', place: 'Washroom', room: 'W1', block: 'D', title: 'Tap leaking under the sink', item: 'tap', sub: 'Block D · washroom · photo', age: '1d ago', late: false, dot: 'navy', quote: '“Water collects under the sink by night.”', photo: 'tap', sim: { title: 'W1 · Tap drips all day', sub: 'Sent 4 days ago by a student on the floor. Same washroom, same tap.', short: 'Tap drips all day', ago: '4 days ago' } },
  { id: 'r4', place: 'Room', room: 'B305', block: 'B', title: 'Chair broken, leg loose', item: 'chair', sub: 'Block B · room · photo', age: '4d ago', late: true, dot: 'ring', quote: '“One leg moves when I sit.”', photo: 'chair', sim: { title: 'B305 · Chair leg is loose', sub: 'Sent 5 days ago by the roommate. Same room, same chair.', short: 'Chair leg is loose', ago: '5 days ago' } },
  { id: 'r5', place: 'Room', room: 'C209', block: 'C', title: 'Window will not latch', item: 'window', sub: 'Block C · room · note + photo', age: '4d ago', late: true, dot: 'ring', quote: '“Rain comes in at night.”', photo: 'latch', sim: { title: 'C209 · Window does not close', sub: 'Sent 3 days ago by the roommate. Same room, same window.', short: 'Window does not close', ago: '3 days ago' } },
  { id: 'r6', place: 'Pump room', room: 'PUMP', block: 'A', title: 'Pump motor noisy', item: 'pump motor', sub: 'Block A · pump room · note + photo', age: '6d ago', late: true, dot: 'brick', quote: '“Loud hum from the pump room.”', photo: 'motor', sim: { title: 'Pump room · Motor hums loudly', sub: 'Sent 5 days ago by the warden. Same pump, same noise.', short: 'Motor hums loudly', ago: '5 days ago' } },
]
export const NEW_ROW: Row = { id: 'r7', place: 'Washroom', room: 'W3', block: 'C', title: 'Geyser not heating', item: 'geyser', sub: 'Block C · washroom · note + photo', age: 'just now', late: false, dot: 'navy', quote: '“No hot water since this morning.”', photo: 'geyser', sim: { title: 'W3 · No hot water in the morning', sub: 'Sent yesterday by a student on the floor. Same washroom, same geyser.', short: 'No hot water in the morning', ago: 'yesterday' } }

export const CLOSURES = [
  { place: 'Room' as Place, room: 'BG11', block: 'B', when: 'yesterday 4:52 PM', tech: 'Ravi', did: 'Capacitor replaced. Ran the fan for five minutes.', photo: 'fan' as Photo },
  { place: 'Washroom' as Place, room: 'C-WC', block: 'C', when: 'yesterday 3:40 PM', tech: 'Imran', did: 'Changed the washer and the spindle.', photo: 'tap' as Photo },
  { place: 'Room' as Place, room: 'A205', block: 'A', when: 'yesterday 1:15 PM', tech: 'Deepak', did: 'Replaced both hinges of the almirah.', photo: 'hinge' as Photo },
  { place: 'Corridor' as Place, room: 'F1', block: 'A', when: 'yesterday 11:30 AM', tech: 'Sunil', did: 'New choke fitted in the corridor light.', photo: 'tube' as Photo },
  { place: 'Room' as Place, room: 'B111', block: 'B', when: '2 days ago', tech: 'Ravi', did: 'Fixed the loose switchboard.', photo: 'switch' as Photo },
  { place: 'Washroom' as Place, room: 'D-WC', block: 'D', when: '2 days ago', tech: 'Sunil', did: 'Cleaned the clogged drain.', photo: 'drain' as Photo },
]
export const BLOCKED = [
  { place: 'Pump room' as Place, room: 'PUMP', title: 'Motor burnt out', why: 'Waiting for purchase approval', days: '6d', sub: 'Blocked 6 days · Block A · water pump room', photo: 'motor' as Photo },
  { place: 'Washroom' as Place, room: 'B-WC', title: 'Geyser leaks', why: 'Vendor visit booked Tuesday', days: '4d', sub: 'Blocked 4 days · Block B · washroom geyser', photo: 'geyser' as Photo },
  { place: 'Room' as Place, room: 'F11', title: 'Door lock stuck', why: 'No master key for this floor', days: '3d', sub: 'Blocked 3 days · Block F · door lock', photo: 'door' as Photo },
  { place: 'Room' as Place, room: 'C102', title: 'Window glass cracked', why: 'Part not in stock', days: '3d', sub: 'Blocked 3 days · Block C · window', photo: 'latch' as Photo },
]
export const DISPUTES = [
  { place: 'Room' as Place, room: 'B305', item: 'Chair', tech: 'Ravi', student: '“Still wobbly. The leg moves.”', techSays: '“Tightened the screw, tested it.”', open: '1d open', photo: 'chair' as Photo },
  { place: 'Corridor' as Place, room: 'F2', item: 'Router', tech: 'Imran', student: '“Light is still red.”', techSays: '“Light was green when I left.”', open: '2d open', photo: 'router' as Photo },
  { place: 'Washroom' as Place, room: 'A-WC', item: 'Tap', tech: 'Deepak', student: '“It drips again.”', techSays: '“Changed the washer, no drip.”', open: '3d open', photo: 'tap' as Photo },
]
export const FIXTURES = [
  { place: 'Room' as Place, room: 'BG04', item: 'Ceiling fan', sub: 'Block C · room · 3 repairs in 5 months' },
  { place: 'Washroom' as Place, room: 'B-WC', item: 'Geyser', sub: 'Block B · washroom · 3 repairs in 4 months' },
  { place: 'Corridor' as Place, room: 'F2', item: 'Router', sub: 'Block A · corridor · 2 repairs in 3 weeks' },
  { place: 'Room' as Place, room: 'C102', item: 'Window latch', sub: 'Block C · room · 2 repairs in 2 months' },
  { place: 'Washroom' as Place, room: 'A-WC', item: 'Tap', sub: 'Block A · washroom · 2 repairs in 6 weeks' },
]
export const TEAM = [
  { name: 'Ravi', blocks: 'BG, F, C' }, { name: 'Imran', blocks: 'A, B' }, { name: 'Deepak', blocks: 'C, D' }, { name: 'Sunil', blocks: 'D, E' },
]

export type State = {
  signedIn: boolean; email: string; rows: Row[]; closureAt: number; blockedLeft: number[]; disputesLeft: number[]
  escalated: number[]; moved: boolean; leftAlone: boolean; setupDone: boolean; bhawanName: string; blocks: number; replaceSuggested: number[]
  rules: number[]; rulesSaved: boolean; shift: number[]; blockSet: number[]
}
export const store = createStore<State>('align.sup.fig.v3', () => ({
  signedIn: false, email: '', rows: ROWS, closureAt: 0, blockedLeft: [0, 1, 2, 3], disputesLeft: [0, 1, 2],
  escalated: [], moved: false, leftAlone: false, setupDone: false, bhawanName: 'Himalaya Bhawan', blocks: 4, replaceSuggested: [], rules: [0, 0, 0, 0, 0, 0, 0], rulesSaved: false, shift: [0, 0, 0, 0], blockSet: [0, 0, 0, 0],
}))
