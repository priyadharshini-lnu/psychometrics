import { useRef, useEffect, useState } from 'react'
import DailyIframe, { DailyCall, DailyCallOptions } from '@daily-co/daily-js'

const CALL_OPTIONS: DailyCallOptions = {
  iframeStyle: {
    width: '100%',
    height: '100%',
    border: '0',
  },
  showLeaveButton: true,
  showFullscreenButton: true,
  cssText: '.record-controls { display: none !important; }',
  theme: {
    colors: {
      // TODO: use theme colors, variables don't work here
      accent: '#009ea7',
      accentText: '#FFFFFF',
    },
  },
}
type Props = {
  url: string,
  token: string,
}
const Meet = ({ url, token }: Props) => {
  const videoRef = useRef(null)
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null)

  useEffect(() => {
    if (!videoRef || !videoRef?.current || callFrame) return
    CALL_OPTIONS.url = url
    CALL_OPTIONS.token = token

    const newCallFrame = DailyIframe.createFrame(
      videoRef.current,
      CALL_OPTIONS,
    )

    newCallFrame.join().then(() => {
      setCallFrame(newCallFrame)
    })

    newCallFrame.leave().then(() => {
      window.close()
    })
  }, [videoRef])

  return (
    <div style={{ width: '100%', height: '100%' }} ref={videoRef} />
  )
}

export default Meet
