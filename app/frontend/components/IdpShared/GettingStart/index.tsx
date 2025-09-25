import {
  Typography, Flex,
} from 'antd'
import { ButtonWithArrow } from '~/glint'
import { RocketLaunchIcon } from '~/glint/icons'
import styles from './GettingStart.less'
import { SafeHTML } from '~/components/SafeHTML'
import { Separator } from '../Separator'

const { I18n } = window

export const GettingStart = ({ next, introMessage }) => (
  <Flex vertical align="center" justify="center" className="ta-c">
    <Flex vertical justify="center" align="center" className="mt-8 mb-4">
      <LaunchIcon />
      <Typography.Title className="mb-0" level={4}>{I18n.t('idp.initial_steps.getting_started')}</Typography.Title>
    </Flex>
    <Separator className="mb-4 mt-0" />
    <SafeHTML html={introMessage} config="adminRichText" />
    <Separator />
    <div className="flex justify-center mb-4">
      <ButtonWithArrow
        label={I18n.t('common.actions.continue')}
        size="small"
        type="primary"
        className="fs-14"
        style={{ borderRadius: '2px' }}
        onClick={() => next()}
      />
    </div>
  </Flex>
)

const LaunchIcon = () => (
  <div className={`${styles.iconContainer} flex justify-center items-center`}>
    <RocketLaunchIcon height="3em" width="3em" />
  </div>
)
