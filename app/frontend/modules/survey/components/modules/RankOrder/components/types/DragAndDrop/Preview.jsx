import _ from 'lodash'
import { useState, useContext } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay,
  defaultDropAnimation, KeyboardSensor,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { MediaQueryContext } from '~/glint'

import { DragItem, DragItemSortable } from './DragItem'

import styles from './DragAndDrop.less'

const { I18n: I18nTextTranslations } = window

export default function Preview ({ I18n, model }) {
  const [activeId, setActiveId] = useState(null)
  const { isMobile } = useContext(MediaQueryContext)

  const dragDropInstructions = isMobile
    ? I18nTextTranslations.t('frontend.aria.drag_drop_instructions_mobile')
    : I18nTextTranslations.t('frontend.aria.drag_drop_instructions_desktop')

  const dataForState = model => ({
    data: _.map(model.result.answers, answer => ({
      id: answer.index,
      text: I18n.tQuestion(model, `choicesTexts${answer.index + 1}`, { choice: answer.index })
                || model.moduleConfig.defaultChoiceText(answer.index + 1),
      showDescription: model.props.showDescription,
      description: I18n.tQuestion(model, `descriptionTexts${answer.index + 1}`, { choice: answer.index }),
    })),
  })

  const { data } = dataForState(model)
  const currentActiveItem = activeId ? data.find(item => item.text === activeId) : null
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }))
  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  }

  const prefixedItemIds = data.map(item => item.text)

  const handleDragItem = (activeId, overId) => {
    const droppedItemId = data.find(item => item.text === activeId)?.id
    const droppedItemIndex = data.findIndex(item => item.id === droppedItemId)
    const droppedOntoItemId = data.find(item => item.text === overId)?.id
    const itemDroppedOntoIndex = data.findIndex(item => item.id === droppedOntoItemId)
    if (droppedItemIndex === undefined || itemDroppedOntoIndex === undefined) {
      return null
    }

    const rearrangedItems = arrayMove(data, droppedItemIndex, itemDroppedOntoIndex)

    model.result.answer(rearrangedItems.map((item, i) => ({ index: item.id, value: i })))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    const activeId = active?.id
    const overId = over?.id
    if (!overId) {
      return null
    }

    if (prefixedItemIds.includes(activeId) && overId) {
      handleDragItem(activeId, overId)
      return null
    }

    return null
  }

  const handleDragStart = ({ active }) => {
    const { id } = active
    setActiveId(id)
    return null
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }


  return (
    <>
      <span className="sr-only">{dragDropInstructions}</span>
      <ul className={styles.preview}>
        <DndContext
          measuring={{
            droppable: {
              strategy: verticalListSortingStrategy,
            },
          }}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={[...prefixedItemIds]}
            strategy={verticalListSortingStrategy}
          >
            {data.map((item, index) => (
              <DragItemSortable
                id={`drag-item-${model.id}-${item.id}`}
                key={item.id}
                sortId={item.text}
                number={index + 1}
                text={item.text}
                showDescription={item.showDescription}
                description={item.description}
              />
            ))}
          </SortableContext>
          {createPortal(
            <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
              {
              activeId && prefixedItemIds.includes(activeId) ? (
                <div className={`${styles.preview} ${styles.dragging}`}>
                  <DragItem
                    number={data.findIndex(item => currentActiveItem.id === item.id) + 1}
                    text={currentActiveItem.text}
                    showDescription={currentActiveItem.showDescription}
                    description={currentActiveItem.description}
                  />
                </div>
              ) : null
            }
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </ul>
    </>
  )
}
