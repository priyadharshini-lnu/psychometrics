import React, { useEffect, useState, useRef } from 'react'
import { Flex, Typography, Empty } from 'antd'
import cs from 'classnames'
import { AvailableDevelopmentActions } from '..'
import Tags from './Tags'
import styles from './DevelopmentActionsList.less'

type Props = {
  availableActions: AvailableDevelopmentActions[];
  onDevelopmentActionClick: (developmentAction: Partial<AvailableDevelopmentActions>) => void;
  highlightNewlyAddedActions?: boolean;
};

const DevelopmentActionsList: React.FC<Props> = ({
  availableActions,
  onDevelopmentActionClick,
  highlightNewlyAddedActions = false,
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


  return (
    <Flex vertical className={styles.card_content} ref={listRef}>
      {availableActions.length > 0 ? (
        availableActions.map((developmentAction, index) => (
          <Flex
            onClick={() => onDevelopmentActionClick(developmentAction)}
            className={cs(styles.card, {
              [styles.highlight]: highlightedIdsState.includes(developmentAction.id ?? index),
            })}
            gap={16}
            key={developmentAction.id ?? index}
            data-id={developmentAction.id ?? index}
          >
            <Flex vertical flex={1}>
              {developmentAction.name ? (
                <Typography.Title
                  level={5}
                  ellipsis={{
                    rows: 2,
                    expandable: true,
                    symbol: 'more',
                    onExpand: e => e.stopPropagation(),
                  }}
                >
                  {developmentAction.name}
                </Typography.Title>
              ) : null}
              <Typography.Paragraph
                className="mb-1"
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: 'more',
                  onExpand: e => e.stopPropagation(),
                }}
              >
                {developmentAction.description}
              </Typography.Paragraph>
              <Flex>
                <Tags type={developmentAction.learningStyle} />
              </Flex>
            </Flex>
            {developmentAction.image ? (
              <Flex>
                <img src={developmentAction.image} className={styles.image} />
              </Flex>
            ) : null}
          </Flex>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Flex>
  )
}

export default DevelopmentActionsList
