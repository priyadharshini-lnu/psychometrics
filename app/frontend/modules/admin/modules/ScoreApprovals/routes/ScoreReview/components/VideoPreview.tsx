import { Flex } from 'antd'
import {
  forwardRef, useImperativeHandle, useRef,
} from 'react'
import VideoPlayer from '~/components/MediaRecorder/components/VideoPlayer'
import styles from '../ScoreReview.less'

interface MediaResponseLike {
  url?: string
}

interface MediaPlayerLike {
  currentTime: ((seconds: number) => void) | number
  play: () => Promise<void> | void
  pause: () => void
  on: (event: string, handler: EventListener) => void
  off: (event: string, handler: EventListener) => void
}

interface PlayerRefHandle {
  player: MediaPlayerLike | null
}

interface ScoreReviewPlaybackPlayerProps {
  mediaResponse?: MediaResponseLike
}

interface VideoPreviewProps {
  mediaResponse?: MediaResponseLike
  playerRef?: React.Ref<PlayerRefHandle>
}

const ScoreReviewPlaybackPlayer = forwardRef<PlayerRefHandle, ScoreReviewPlaybackPlayerProps>(
  ({ mediaResponse }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useImperativeHandle(ref, () => ({
      player: videoRef.current
        ? {
          currentTime: (seconds: number) => {
            if (videoRef.current) {
              videoRef.current.currentTime = seconds
            }
          },
          play: () => videoRef.current?.play(),
          pause: () => videoRef.current?.pause(),
          on: (event: string, handler: EventListener) => videoRef.current?.addEventListener(event, handler),
          off: (event: string, handler: EventListener) => videoRef.current?.removeEventListener(event, handler),
        }
        : null,
    }), [])

    return (
      <div className={styles.mediaRecorderVideoWrapper}>
        <VideoPlayer
          videoRef={videoRef}
          mediaUrl={mediaResponse?.url}
          permissionGranted
          status="stopped"
          onPlay={() => {}}
          visualizing={false}
          stream={null}
          videoDevices={[]}
          audioDevices={[]}
          onChangeVideoDevice={() => {}}
          onChangeAudioDevice={() => {}}
          showDeviceSelectors={false}
        />
      </div>
    )
  },
)

ScoreReviewPlaybackPlayer.displayName = 'ScoreReviewPlaybackPlayer'

export const VideoPreview = ({ mediaResponse, playerRef }: VideoPreviewProps) => (
  <Flex className={styles.video}>
    <ScoreReviewPlaybackPlayer ref={playerRef} mediaResponse={mediaResponse} />
  </Flex>
)
