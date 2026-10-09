import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Countdown timer driven by requestAnimationFrame.
 * Pauses when `running` is false or the browser tab is hidden.
 * Returns remaining milliseconds.
 */
export function useGameTimer(durationMs: number, running: boolean, onEnd: () => void) {
  const [remaining, setRemaining] = useState(durationMs)
  const remRef = useRef(durationMs)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd
  const [hidden, setHidden] = useState(() => document.hidden)

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (!running || hidden) return
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      remRef.current = Math.max(0, remRef.current - (now - last))
      last = now
      setRemaining(remRef.current)
      if (remRef.current <= 0) {
        onEndRef.current()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, hidden])

  const reset = useCallback(() => {
    remRef.current = durationMs
    setRemaining(durationMs)
  }, [durationMs])

  return { remaining, reset }
}
