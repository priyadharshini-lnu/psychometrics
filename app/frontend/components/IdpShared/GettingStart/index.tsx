import { Space, Typography } from 'antd'
import { ButtonWithArrow, BoxWithShadow } from '~/glint'
import { RocketLaunchIcon } from '~/glint/icons'
import styles from './GettingStart.less'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

export const GettingStart = ({ next, introMessage }) => (
  <>
    <BoxWithShadow className={styles.box}>
      <Space size="middle" direction="vertical" className="ta-c">
        <div className="flex justify-center">
          <LaunchIcon />
        </div>
        <Typography.Title level={4}>{I18n.t('idp.initial_steps.getting_started')}</Typography.Title>
        <SafeHTML html={introMessage} config="adminRichText" />
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

const LaunchIcon = () => (
  <div className={`${styles.iconContainer} flex justify-center items-center`}>
    <RocketLaunchIcon height="3em" width="3em" />
  </div>
)
