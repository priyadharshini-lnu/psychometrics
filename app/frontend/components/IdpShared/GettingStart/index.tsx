import { FC } from 'react'
import { Space, Typography } from 'antd'
import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import { RocketLaunchIcon } from '~/glint/icons'
import VideoPlayer from '~/modules/survey/components/modules/VideoResponse/VideoPlayer'
import styles from './GettingStart.less'

// to be replaced with actual video url
const mediaResponse = {
  url: '',
}

const { I18n } = window

export const GettingStart = ({ next }) => (
  <>
    <BoxWithShadow className={styles.box}>
      <Space size="middle" direction="vertical" className="ta-c">
        <div className="flex justify-center">
          <LaunchIcon />
        </div>
        <Typography.Title level={4}>{I18n.t('idp.initial_steps.getting_started')}</Typography.Title>
        <Typography.Text>
          {I18n.t('idp.initial_steps.getting_started_info')}
        </Typography.Text>
        <VideoPlayerContainer mediaResponse={mediaResponse} />
        <div className="flex justify-center">
          <ButtonWithArrow
            label={I18n.t('common.actions.continue')}
            size="small"
            type="primary"
            onClick={() => next()}
          />
        </div>
      </Space>
    </BoxWithShadow>
  </>
)

type VideoPlayerContainerProps = {
  mediaResponse: {
    url: string
  }
}
const VideoPlayerContainer: FC<VideoPlayerContainerProps> = ({ mediaResponse }) => (
  <div className="flex justify-center">
    <div className={`${styles.video}`}>
      <VideoPlayer mediaResponse={mediaResponse} />
    </div>
  </div>

)

const LaunchIcon = () => (
  <div className={`${styles.iconContainer} flex justify-center items-center`}>
    <RocketLaunchIcon height="3em" width="3em" />
  </div>
)
