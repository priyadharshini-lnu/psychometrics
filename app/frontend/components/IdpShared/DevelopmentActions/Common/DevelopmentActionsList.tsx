import React, {
  useEffect, useState, useRef, useContext,
} from 'react'
import {
  Flex, Typography, Empty, Checkbox,
} from 'antd'
import cs from 'classnames'
import { includes, uniqBy } from 'lodash'
import { Separator } from '../../Separator'
import { DevelopmentAction } from '../Types'
import styles from './DevelopmentActionsList.less'
import {
  MediaQueryContext,
} from '~/glint'
import { developmentActionLearningStylesConfig } from '../Constants'

type Props = {
  availableActions: DevelopmentAction[];
  selectedDA: DevelopmentAction[];
  selectedDevelopmentActionIds?: (string | number)[];
  setSelectedDA: (da:DevelopmentAction[]) => void
};

const DevelopmentActionsList: React.FC<Props> = ({
  availableActions,
  selectedDevelopmentActionIds = [],
  selectedDA,
  setSelectedDA,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null)

  const { isMobile } = useContext(MediaQueryContext)

  const [selectedDAIds, setSelectedDAIds] = useState<number[]>(selectedDA.map(da => Number(da.id)))

  useEffect(() => {
    setSelectedDAIds(selectedDA.map(da => Number(da.id)))
  }, [selectedDA])

  const filteredActions = availableActions
    .filter((da => !selectedDevelopmentActionIds.includes(Number(da.id))))
  return (
    <Flex vertical className={styles.card_content} ref={listRef}>
      {filteredActions.length > 0 ? (
        <Checkbox.Group
          value={selectedDAIds}
          onChange={(checkedValues) => {
            if (checkedValues.length === 0) {
              // DAs which are selected but not part of availableActions due to filtering, shall remain unaffected
              const untouchedDAs = selectedDA.filter(da => !availableActions.map(da => da.id).includes(da.id as number))
              setSelectedDA(uniqBy([...selectedDA.filter(da => !includes(filteredActions.map(da => da.id), da.id)),
                ...untouchedDAs], 'id'))
              return
            }

            setSelectedDA([...selectedDA.filter(da => !includes(filteredActions.map(da => da.id), da.id)),
              ...filteredActions.filter(da => checkedValues.map(value => Number(value)).includes(Number(da.id)))])
          }}
        >
          {filteredActions.map((developmentAction, index) => (

            <Flex
              vertical
              className={cs('w-100', styles.card, {
                [styles.card_selected]: includes(selectedDevelopmentActionIds, developmentAction.id)
                  || includes(selectedDAIds, Number(developmentAction.id)),
              })}
              key={developmentAction.id}
            >
              <Checkbox
                value={Number(developmentAction.id)}
                disabled={includes(selectedDevelopmentActionIds, developmentAction.id)}
              >
                <Flex
                  gap={16}
                  data-id={developmentAction.id ?? index}
                  vertical={isMobile}
                >
                  <Flex vertical flex={1}>
                    {developmentAction.name ? (
                      <Typography.Title
                        level={5}
                        className="mb-0"
                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                      >
                        {developmentAction.name}
                      </Typography.Title>
                    ) : null}
                    <Typography.Paragraph
                      className="mb-2 font-normal fs-14"
                      ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                    >
                      {developmentAction.description}
                    </Typography.Paragraph>
                    <Flex gap={4} align="center">
                      <img
                        src={developmentActionLearningStylesConfig[developmentAction.learningStyle].logo}
                      />
                      <strong>
                        {`${developmentActionLearningStylesConfig[developmentAction.learningStyle].duration}%`}
                      </strong>
                      <Typography.Text
                        className="font-normal"
                        type="secondary"
                      >
                        {developmentActionLearningStylesConfig[developmentAction.learningStyle].text}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  {developmentAction.image ? (
                    <Flex>
                      <img src={developmentAction.image} className={styles.image} />
                    </Flex>
                  ) : null}
                </Flex>
              </Checkbox>
              <Separator
                className="mb-0 mt-4"
              />
            </Flex>
          ))}
        </Checkbox.Group>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Flex>
  )
}

export default DevelopmentActionsList
