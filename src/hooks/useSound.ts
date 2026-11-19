import { useCallback, useRef, useState } from 'react'

export type SoundKind = 'chomp' | 'bleh' | 'combo' | 'tick' | 'go' | 'end' | 'coin'

const KEY = 'swipesort.settings.v1'

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { sound: s.sound !== false }
  } catch {
    return { sound: true }
  }
}

// [frequency Hz, start offset s, duration s]
const TONES: Record<SoundKind, [number, number, number][]> = {
  chomp: [[180, 0, 0.07], [120, 0.06, 0.06], [420, 0.12, 0.1]],
  bleh: [[260, 0, 0.12], [200, 0.1, 0.12], [140, 0.2, 0.2]],
  coin: [[988, 0, 0.06], [1319, 0.06, 0.14]],
  combo: [[523, 0, 0.09], [659, 0.08, 0.09], [784, 0.16, 0.09], [1047, 0.24, 0.2]],
  tick: [[600, 0, 0.07]],
  go: [[880, 0, 0.25]],
  end: [[392, 0, 0.15], [330, 0.15, 0.15], [262, 0.3, 0.3]],
}

const VIBRATE: Record<SoundKind, number | number[]> = {
  chomp: 15,
  bleh: [60, 40, 60],
  coin: 0,
  combo: [20, 30, 20, 30, 60],
  tick: 0,
  go: 0,
  end: [120],
}

export function useSound() {
  const [settings, setSettings] = useState(loadSettings)
  const ctxRef = useRef<AudioContext | null>(null)

  const persist = (s: { sound: boolean }) => {
    setSettings(s)
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  }

  const play = useCallback(
    (kind: SoundKind) => {
      if (VIBRATE[kind] && typeof navigator.vibrate === 'function') {
        navigator.vibrate(VIBRATE[kind])
      }
      if (!settings.sound) return
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = (ctxRef.current ??= new Ctx())
        if (ctx.state === 'suspended') void ctx.resume()
        for (const [freq, at, dur] of TONES[kind]) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const t = ctx.currentTime + at
          osc.type = kind === 'bleh' ? 'sawtooth' : 'triangle'
          osc.frequency.value = freq
          gain.gain.setValueAtTime(0.0001, t)
          gain.gain.exponentialRampToValueAtTime(0.15, t + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
          osc.connect(gain).connect(ctx.destination)
          osc.start(t)
          osc.stop(t + dur + 0.02)
        }
      } catch {
        /* audio unavailable */
      }
    },
    [settings],
  )

  return {
    soundOn: settings.sound,
    toggleSound: () => persist({ ...settings, sound: !settings.sound }),
    play,
  }
}

export type SoundApi = ReturnType<typeof useSound>
