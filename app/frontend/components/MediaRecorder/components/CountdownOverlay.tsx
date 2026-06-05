import { useState, useEffect, useRef } from 'react'
import styles from '../styles.less'

interface CountdownOverlayProps {
  onComplete: () => void;
  startFrom?: number;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  onComplete,
  startFrom = 3,
}) => {
  const [count, setCount] = useState(startFrom)
  const [animKey, setAnimKey] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onCompleteRef.current()
          return 0
        }
        return prev - 1
      })
      setAnimKey(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <div className={styles.countdownOverlay}>
      <span key={animKey} className={styles.countdownNumber}>
        {count}
      </span>
    </div>
  )
}

export default CountdownOverlay
