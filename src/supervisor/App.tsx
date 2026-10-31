import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FlaskConical, X, Volume2, VolumeX, RotateCcw, Keyboard } from '../ds/icons'
import { useNav, Stage } from '../ds/nav'
import { ToastHost, ToastOutlet, useToast, Tooltip, cx } from '../ds/ui'
import { fx, setMuted, useMuted } from '../ds/fx'
import { Ctx, Screen, Rail, NO_RAIL } from './shell'
import * as V from './screens'
import { store } from './store'

function Inner() {
  const nav = useNav<Screen>((new URLSearchParams(location.search).get('s') as Screen) || (store.get().signedIn ? 'home' : 'login'), 'swap')
  const toast = useToast()
  const [online, setOnline] = useState(navigator.onLine)
  const [sim, setSim] = useState(false); const [keys, setKeys] = useState(false)
  const muted = useMuted()
  useEffect(() => { const u = () => setOnline(true), d = () => setOnline(false); addEventListener('online', u); addEventListener('offline', d); return () => { removeEventListener('online', u); removeEventListener('offline', d) } }, [])
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === '?' && !(e.target instanceof HTMLInputElement)) setKeys(x => !x); if (e.key === 'Escape') { setKeys(false); setSim(false) } }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])

  const newReport = () => {
    const id = String(2420 + Math.floor(Math.random() * 60))
    store.set(s => ({ reps: [{ id, room: 'C-117', block: 'C', item: 'Geyser', issue: 'No hot water', trade: 'Plumbing', note: 'Since this morning. The light on the switch is off.', student: 'Harini Srinivasan', at: Date.now(), photo: null, status: 'new' }, ...s.reps] }))
    toast({ kind: 'bar', title: 'New report · C-117 geyser', body: 'From Harini Srinivasan', action: { label: 'Open', run: () => nav.go('review', { tr: 'swap', p: { id } }) } })
  }
  const actions: [string, () => void][] = [
    ['A student reports a new problem', newReport],
    ['Show: page not found', () => nav.go('e404')], ['Show: no connection', () => nav.go('eOffline')], ['Show: server error', () => nav.go('e500')], ['Show: session expired', () => nav.go('expired')],
  ]
  const v: Record<Screen, React.ReactElement> = {
    login: <V.Login />, home: <V.HomeScreen />, check: <V.CheckScreen />, review: <V.Review />, closure: <V.Closure />, forecast: <V.Forecast />, blocked: <V.Blocked />, blockedOne: <V.BlockedOne />,
    disputes: <V.Disputes />, disputeOne: <V.DisputeOne />, fixtures: <V.Fixtures />, fixtureOne: <V.FixtureOne />, team: <V.Team />, tech: <V.Tech />, rules: <V.Rules />,
    e404: <V.ErrorPage kind="e404" />, eOffline: <V.ErrorPage kind="eOffline" />, e500: <V.ErrorPage kind="e500" />, expired: <V.ErrorPage kind="expired" />,
  }
  return (
    <Ctx.Provider value={{ nav, toast, online }}>
      <div className="fixed inset-0 min-w-[1100px] bg-cream">
        {NO_RAIL.includes(nav.screen) ? <Stage nav={nav as never}>{v[nav.screen]}</Stage> : (
          <div className="flex h-full">
            <Rail />
            <div className="relative min-w-0 flex-1 overflow-hidden"><Stage nav={nav as never}>{v[nav.screen]}</Stage></div>
          </div>
        )}
        <ToastOutlet placement="bottom" />
        {nav.screen !== 'login' && (
          <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            <AnimatePresence>
              {sim && (
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="w-[320px] rounded-[20px] border-2 border-navy bg-paper p-4 shadow-lift">
                  <div className="mb-1 flex items-center justify-between"><span className="font-head text-[18px] font-extrabold">Simulate</span><button aria-label="Close" onClick={() => setSim(false)} className="rounded-full p-1 hover:bg-navy/5"><X size={18} /></button></div>
                  <p className="mb-3 text-[13px] text-mid">What students and technicians would do. For trying the desk.</p>
                  <div className="flex flex-col gap-2">{actions.map(([l, f]) => <button key={l} onClick={() => { fx.tap(); setSim(false); f() }} className="rounded-[12px] border-2 border-royal bg-royal2 px-3 py-2 text-left text-[14px] font-bold text-royal shadow-[0_3px_0_#0E2DD2] active:translate-y-[3px] active:shadow-none">{l}</button>)}</div>
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <button onClick={() => setMuted(!muted)} className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] font-semibold hover:bg-navy/5">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}{muted ? 'Sound off' : 'Sound on'}</button>
                    <button onClick={() => { store.reset(); nav.reset('login') }} className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] font-semibold hover:bg-navy/5"><RotateCcw size={16} />Restart</button>
                    <button onClick={() => { setSim(false); setKeys(true) }} className="flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[13px] font-semibold hover:bg-navy/5"><Keyboard size={16} />Keys</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Tooltip label="Simulate events, sound, restart" side="left">
              <motion.button aria-label="Simulate" onClick={() => { fx.tap(); setSim(!sim) }} whileTap={{ scale: 0.9 }} className={cx('flex h-14 w-14 items-center justify-center rounded-full border-2 border-navy text-white shadow-btn', sim ? 'bg-navy' : 'bg-royal')}><FlaskConical size={24} /></motion.button>
            </Tooltip>
          </div>
        )}
        <AnimatePresence>
          {keys && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setKeys(false)}>
              <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.98, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="w-[420px] rounded-[24px] border-2 border-navy bg-cream p-7 shadow-[0_6px_0_#00224E]">
                <h2 className="font-head text-[24px] font-extrabold">Keyboard shortcuts</h2>
                <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[15px]">
                  {[['1 – 8', 'Jump to a section'], ['/', 'Search on To check'], ['Esc', 'Close a dialog'], ['?', 'Show or hide this']].map(([k, d]) => <React.Fragment key={k}><kbd className="rounded-[8px] border-2 border-navy bg-paper px-2 py-0.5 text-center font-mono text-[14px]">{k}</kbd><span>{d}</span></React.Fragment>)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}
export default function App() { return <ToastHost><Inner /></ToastHost> }
