import type { SoundApi } from '../hooks/useSound'

export default function SoundToggles({ sound }: { sound: SoundApi }) {
  const base = 'clay clay-btn flex h-12 w-12 items-center justify-center text-2xl'
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className={`${base} ${sound.soundOn ? '' : 'opacity-60'}`}
        style={{ borderRadius: 20 }}
        aria-pressed={sound.soundOn}
        aria-label={sound.soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
        onClick={sound.toggleSound}
      >
        {sound.soundOn ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
