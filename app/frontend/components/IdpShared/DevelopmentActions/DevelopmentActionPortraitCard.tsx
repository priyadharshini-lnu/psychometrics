import React from 'react'
import {
  Rate, Progress, Flex, Typography,
} from 'antd'
import { BoxWithShadow } from '~/glint'
import dayjs from '~/utils/dayjs'
import styles from './DevelopmentActionPortraitCard.less'
import { DevelopmentActionWithSkill } from '.'
import { Tags } from './Common'

const { I18n } = window

export const DevelopmentActionPortraitCard: React.FC<DevelopmentActionWithSkill> = ({
  name,
  description,
  progress,
  startDateTime,
  endDateTime,
  learningStyle,
  skill,
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
        <Rate disabled defaultValue={skill.finalRating || skill.initialRating} />
        <Flex className={styles.mb_8}>
          <Tags type={learningStyle} />
        </Flex>
      </Flex>
      <Flex justify="space-between" align="flex-end" gap={4}>
        <Flex
          flex={5}
          justify="flex-start"
          className={styles.py_12}
        >
          {startDateTime && endDateTime ? (
            <Typography.Text>
              {`${dayjs(startDateTime).format('DD MMM')} - ${dayjs(endDateTime).format('DD MMM')}`}
            </Typography.Text>
          ) : null}
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
