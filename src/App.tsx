import { MotionConfig } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { LevelId } from './data/levels'
import { useHighScores } from './hooks/useHighScores'
import { useSound } from './hooks/useSound'
import GameOverScreen from './screens/GameOverScreen'
import type { RoundResult } from './screens/GameOverScreen'
import GameScreen from './screens/GameScreen'
import HomeScreen from './screens/HomeScreen'

type Screen = { name: 'home' } | { name: 'game'; level: LevelId; round: number } | { name: 'over'; result: RoundResult }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [round, setRound] = useState(0)
  const { scores, record } = useHighScores()
  const sound = useSound()

  const start = (level: LevelId) => {
    setRound((r) => r + 1)
    setScreen({ name: 'game', level, round: round + 1 })
  }

  const onFinish = useCallback(
    (r: Omit<RoundResult, 'newBestScore' | 'newBestStreak'>) => {
      const flags = record(r.level, r.score, r.bestStreak)
      setScreen({ name: 'over', result: { ...r, newBestScore: flags.score, newBestStreak: flags.streak } })
    },
    [record],
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-full">
        {screen.name === 'home' && <HomeScreen scores={scores} sound={sound} onStart={start} />}
        {screen.name === 'game' && (
          <GameScreen
            key={screen.round}
            level={screen.level}
            sound={sound}
            onFinish={onFinish}
            onQuit={() => setScreen({ name: 'home' })}
          />
        )}
        {screen.name === 'over' && (
          <GameOverScreen
            result={screen.result}
            sound={sound}
            onPlayAgain={() => start(screen.result.level)}
            onChangeLevel={() => setScreen({ name: 'home' })}
            onHome={() => setScreen({ name: 'home' })}
          />
        )}
      </div>
    </MotionConfig>
  )
}
