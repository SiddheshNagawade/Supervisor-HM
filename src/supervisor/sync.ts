/* Supervisor side of the live link: new student reports show up in "To check"; accepting one schedules it for the technician. */
import { store, ROWS, Row } from './store'
import { pushReq, watchReqs, Remote } from '../data/sync'
const cache = new Map<string, Remote>(), added = new Set<string>(), sent = new Set<string>()
const place = (w: string): Row['place'] => (/corridor/i.test(w) ? 'Corridor' : /washroom/i.test(w) ? 'Washroom' : /pump/i.test(w) ? 'Pump room' : 'Room')
watchReqs(r => {
  cache.set(r.id, r); const d = r.data, id = 'q' + r.id
  if (d.stage <= 1 && !added.has(id) && !sent.has(id)) {
    added.add(id)
    const w = String(d.where || ''), room = w.split(' ').pop() || ''
    const row: Row = { ...ROWS[0], id, place: place(w), room, block: (room[0] || 'B').toUpperCase(), title: d.issue ? `${d.item}: ${d.issue}` : d.item, item: String(d.item || '').toLowerCase(), sub: `${w} · from a student`, age: 'just now', late: false, dot: 'navy', quote: d.note ? `“${d.note}”` : '', photo: null }
    store.set(s => (s.rows.some(x => x.id === id) ? {} : { rows: [row, ...s.rows] }))
  }
})
store.subscribe(() => {
  const rows = store.get().rows
  added.forEach(id => {
    if (sent.has(id) || rows.some(r => r.id === id)) return
    sent.add(id); const r = cache.get(id.slice(1)); if (!r) return
    pushReq({ ...r, data: { ...r.data, stage: 2, tech: 'Ravi Kumar', techTrade: 'Electrician', slot: r.data.slot || '11:00 to 11:30 AM', day: r.data.day || 'Today' } })
  })
})
