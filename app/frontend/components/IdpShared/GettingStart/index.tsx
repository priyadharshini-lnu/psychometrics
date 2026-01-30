import {
  Flex,
} from 'antd'
import { ButtonWithArrow } from '~/glint'
import styles from './GettingStart.less'
import { SafeHTML } from '~/components/SafeHTML'
import { Separator } from '../Separator'

const { I18n } = window

export const GettingStart = ({ next, introMessage }) => (
  <Flex vertical align="center" justify="center" className="ta-c">
    <section className={styles.contentContainer}>
      <SafeHTML html={introMessage} config="adminRichText" />
    </section>
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
