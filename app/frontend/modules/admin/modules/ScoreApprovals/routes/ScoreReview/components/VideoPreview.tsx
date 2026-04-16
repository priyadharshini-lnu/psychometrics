import { Flex } from 'antd'
import 'video.js/dist/video-js.css'
import VideoPlayer from '~/modules/survey/components/modules/VideoResponse/VideoPlayer'
import styles from '../ScoreReview.less'

export const VideoPreview = ({ mediaResponse, playerRef = undefined }) => (
  <Flex className={styles.video}>
    <VideoPlayer ref={playerRef} mediaResponse={mediaResponse} />
  </Flex>
)
