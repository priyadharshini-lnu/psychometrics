import {
  Card, Flex, Tag, Typography,
} from 'antd'
import cs from 'classnames'
import styles from '../ScoreReview.less'
import { CheckCircleOutlined, CloseCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

const { I18n } = window

export const Evidence = ({ positive = undefined, children }) => (
  <Card
    classNames={{ body: cs(styles.evidance) }}
    styles={{ root: { borderRadius: 6 } }}
  >
    <Flex vertical gap={8}>
      <Flex justify="space-between">
        {/* wait for implementation times */}
        {/* <Space>
          <Typography.Text type="secondary"><ClockCircleOutlined /></Typography.Text>
          <Typography.Text>
            2:55
          </Typography.Text>
        </Space> */}
        {/* remove undefined check after implementation */}
        {positive !== undefined && (positive
          ? (
            <Tag variant="outlined" color="success" icon={<CheckCircleOutlined />}>
              {I18n.t('shared.positive')}
            </Tag>
          )
          : (
            <Tag variant="outlined" color="error" icon={<CloseCircleOutlined />}>
              {I18n.t('shared.negative')}
            </Tag>
          ))
          }
      </Flex>
      <Flex align="flex-start" gap={8} className={styles.evidenceContent}>
        <Typography.Text type="secondary" className={styles.quote}>&quot;</Typography.Text>
        <Typography.Text>
          {children}
        </Typography.Text>
      </Flex>
    </Flex>
  </Card>
)
