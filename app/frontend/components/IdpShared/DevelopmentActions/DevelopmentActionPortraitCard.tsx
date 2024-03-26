import React from 'react'
import {
  Rate, Progress, Tag, Flex, Typography,
} from 'antd'
import { BoxWithShadow } from '~/glint'
import dayjs from '~/utils/dayjs'
import { Skill } from './DevelopmentActionListView'
import styles from './DevelopmentActionPortraitCard.less'

const { I18n } = window

export const DevelopmentActionPortraitCard: React.FC<Skill> = ({
  name,
  rating,
  description,
  durationType,
  durationNumber,
  progress,
  startDate,
  endDate,
}) => (
  <BoxWithShadow className={styles.p_16}>
    <Flex vertical gap={8}>
      <Flex vertical gap={4}>
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
        >
          {description}
        </Typography.Paragraph>
      </Flex>
      <Flex
        vertical
        gap={8}
      >
        <Flex gap={4}>
          <span>{`${I18n.t('idp.development_actions.skills')}:`}</span>
          <p className={styles.m_none}>{name}</p>
        </Flex>
        <Rate disabled defaultValue={rating} />
        <Flex gap={8} className={styles.mb_8}>
          <Tag color="geekblue">{durationType}</Tag>
          <Tag>{durationNumber}</Tag>
        </Flex>
      </Flex>
      <Flex justify="space-between" align="flex-end" gap={4}>
        <Flex
          flex={5}
          justify="flex-start"
          className={styles.py_12}
        >
          <Typography.Text>
            {`${dayjs(startDate).format('DD MMM')} - ${dayjs(endDate).format('DD MMM')}`}
          </Typography.Text>
        </Flex>
        <Flex
          vertical
          flex={6}
          gap={4}
          justify="flex-start"
          align="flex-end"
          className={styles.p_12}
        >
          <Progress percent={progress} className={styles.m_none} />
        </Flex>
      </Flex>
    </Flex>
  </BoxWithShadow>
)
