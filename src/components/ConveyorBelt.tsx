export default function ConveyorBelt({ running }: { running: boolean }) {
  return (
    <div className="relative mx-[-6px] h-7" aria-hidden>
      <div
        className={`absolute inset-x-0 top-0 h-5 rounded-full ${running ? 'belt-run' : ''}`}
        style={{
          backgroundColor: '#4a4f5c',
          backgroundImage: 'repeating-linear-gradient(115deg, #3a3e49 0 12px, #5b6170 12px 24px)',
          backgroundSize: '36px 100%',
          boxShadow: 'inset 0 4px 0 rgba(255,255,255,.25), inset 0 -4px 0 rgba(0,0,0,.25), 0 5px 0 #2c2f38, 0 10px 14px rgba(0,0,0,.25)',
        }}
      />
      <div className="absolute -bottom-0 left-3 h-3 w-3 rounded-full bg-[#2c2f38]" />
      <div className="absolute -bottom-0 right-3 h-3 w-3 rounded-full bg-[#2c2f38]" />
    </div>
  )
}
