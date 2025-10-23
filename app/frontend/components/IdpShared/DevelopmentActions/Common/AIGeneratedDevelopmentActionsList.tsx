/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState, useRef } from 'react'
import {
  Flex, Typography, Empty, Checkbox,
} from 'antd'
import cs from 'classnames'
import { includes } from 'lodash'
import { Separator } from '../../Separator'
import { DevelopmentAction, DevelopmentActionLearningStyle } from '../Types'
import styles from './DevelopmentActionsList.less'
import { developmentActionLearningStylesConfig } from '../Constants'

type Props = {
  availableActions: DevelopmentAction[];
  highlightNewlyAddedActions?: boolean;
  selectedAIGeneratedDevelopmentActions: Partial<DevelopmentAction>[]
  selectedDA: Partial<DevelopmentAction>[]
  setSelectedDA: (actions: Partial<DevelopmentAction>[]) => void
};

const AIGeneratedDevelopmentActionsList: React.FC<Props> = ({
  availableActions,
  highlightNewlyAddedActions = false,
  selectedAIGeneratedDevelopmentActions,
  selectedDA,
  setSelectedDA,
}) => {
  const [highlightedIdsState, setHighlightedIdsState] = useState<(string | number)[]>([])
  const previousDevelopmentActionsIdRef = useRef<Set<string | number>>(new Set())
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!highlightNewlyAddedActions) {
      return
    }

    const newIds = availableActions
      .map((action, index) => action.id ?? index)
      .filter(
        id => !previousDevelopmentActionsIdRef.current.has(id),
      )

    if (newIds.length > 0 && newIds.length !== availableActions.length) {
      setHighlightedIdsState(newIds)

      const firstNewElement = listRef.current?.querySelector(`[data-id="${newIds[0]}"]`)
      if (firstNewElement) {
        firstNewElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    previousDevelopmentActionsIdRef.current = new Set(availableActions.map((action, index) => action.id ?? index))

    const timeout = setTimeout(() => {
      setHighlightedIdsState([])
    }, 3000)

    return () => clearTimeout(timeout)
  }, [availableActions])


  const filteredActions = availableActions
    .filter((da => !selectedAIGeneratedDevelopmentActions.map(da => da.customAction)
      .includes(da.description)))

  return (
    <Flex vertical className={styles.card_content} ref={listRef}>
      {filteredActions.length > 0 ? (
        <Checkbox.Group
          onChange={(checkedValues) => {
            setSelectedDA(filteredActions.filter(da => checkedValues.includes(da.description)))
          }}
          value={selectedDA.map(da => da.description)}
        >
          {filteredActions.map((developmentAction, index) => (
            <Flex
              vertical
              className={cs('w-100', styles.card, {
                [styles.highlight]: highlightedIdsState.includes(developmentAction.id ?? index),
                [styles.card_selected]:
                  includes(selectedDA.map(da => da.description),
                    developmentAction.description),
              })}
            >
              <Checkbox
                value={developmentAction.description}
              >
                <Flex
                  gap={16}
                  data-id={developmentAction.id ?? index}
                >
                  <Flex
                    vertical
                    flex={1}
                  >
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
                        src={developmentActionLearningStylesConfig[developmentAction.learningStyle as
                           DevelopmentActionLearningStyle].logo}
                      />
                      <strong>
                        {`${developmentActionLearningStylesConfig[developmentAction.learningStyle as
                           DevelopmentActionLearningStyle].duration}%`}
                                          &nbsp;
                      </strong>
                      <Typography.Text
                        className="font-normal"
                        type="secondary"
                      >
                        {developmentActionLearningStylesConfig[developmentAction.learningStyle as
                           DevelopmentActionLearningStyle].text}
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

export default AIGeneratedDevelopmentActionsList
