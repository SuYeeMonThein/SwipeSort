import confetti from 'canvas-confetti'

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function comboConfetti() {
  if (reduced()) return
  void confetti({ particleCount: 60, spread: 80, origin: { y: 0.55 }, colors: ['#FFC93C', '#FF6B6B', '#3DDC84', '#9B5CFF'] })
}

export function recordConfetti() {
  if (reduced()) return
  const fire = (x: number) => void confetti({ particleCount: 90, spread: 90, startVelocity: 45, origin: { x, y: 0.7 }, colors: ['#FFC93C', '#FF6B6B', '#3DDC84', '#9B5CFF', '#fff'] })
  fire(0.2)
  fire(0.8)
  setTimeout(() => fire(0.5), 250)
}
