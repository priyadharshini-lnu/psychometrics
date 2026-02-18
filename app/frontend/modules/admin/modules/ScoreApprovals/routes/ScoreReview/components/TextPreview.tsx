import { Flex } from 'antd'
import styles from '../ScoreReview.less'

export const TextPreview = ({ result }) => (
  <Flex gap={16}>
    <Flex flex={1} className={styles.rawTextResult}>
      {result?.answers?.[0]?.value}
    </Flex>
  </Flex>
)
