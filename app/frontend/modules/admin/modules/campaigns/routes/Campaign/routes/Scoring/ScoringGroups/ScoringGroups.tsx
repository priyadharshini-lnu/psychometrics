import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import cs from 'classnames'
import {
  Row, Col, Space, Button, Typography, Dropdown, Empty, Flex,
} from 'antd'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimation,
  MeasuringStrategy,
  DropAnimation,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { PlusOutlined } from '@ant-design/icons'

import { AddGroupForm } from './AddGroupForm'
import { GroupCard, GroupCardSortable, type CampaignFactorGroup } from './GroupCard'
import { getGroupById, updateArrayItemsPositionOnIndices, getItemIdFromSortingId } from '~/utils/dnd'

// Added for testing purpose
const factors = [
  { id: 1, name: 'Factor 1' },
  { id: 2, name: 'Factor 2' },
]

const { I18n } = window

export const ScoringGroups = () => {
  const [addGroup, setAddGroup] = useState(false)
  const [groups, setGroups] = useState<CampaignFactorGroup[]>([])
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))
  const [activeId, setActiveId] = useState<string | null>(null)

  const prefixedGroupIds = groups.map(group => `group_${group.id}`)
  const prefixedFactorIds = factors.map(
    factor => `f${factor.id}`,
  )

  const sortedGroups = useMemo(() => {
    const sorted = [...groups].sort((a, b) => a.position - b.position)
    return sorted
  }, [groups])

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  }

  const handleGroupDragnDrop = (activeId: string, overId: string) => {
    const droppedGroupId = getItemIdFromSortingId(activeId)
    const droppedGroup = groups.find(group => group.id === droppedGroupId)
    const droppedOntoGroupId = getItemIdFromSortingId(overId)
    const groupDroppedOnto = groups.find(group => group.id === droppedOntoGroupId)
    if (groupDroppedOnto === undefined || droppedGroup === undefined) {
      return null
    }
    const rearrangedGroups = arrayMove(groups, droppedGroup.position - 1, groupDroppedOnto.position - 1)
    const updatedGroups = updateArrayItemsPositionOnIndices(
      rearrangedGroups,
      'position',
    )

    setGroups(updatedGroups)


    /* post data to backend */
    // const updatedGroupsRequestPayload = updatedGroups.map(group => pick(group, ['id', 'position']))

    // updateGroupPosition(parsedCampaignId, updatedGroupsRequestPayload).then(({ response }) => {
    //   unstable_batchedUpdates(() => {
    //     setGroups(response.groups)
    //     setPastGroups(response.groups)
    //     setAssessments(response.assessments)
    //     setPastAssessments(response.assessments)
    //   })
    // })
    return null
  }

  const handleAddGroup = (data) => {
    const newGroup = { ...data, id: parseInt(data.id, 10) }
    setGroups([...groups, newGroup])

    /* post data to backend */
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const activeId = active?.id
    const overId = over?.id
    if (!overId) {
      return null
    }

    if (prefixedGroupIds.includes(activeId) && overId) {
      handleGroupDragnDrop(activeId, overId)
      return null
    }

    return null
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const { id } = active
    setActiveId(id)
    return null
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <Flex vertical>
      <Row
        justify="space-between"
        align="middle"
        className="p-4"
      >
        <Col>
          <Typography.Title level={3}>
            Scoring
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Dropdown menu={{ items: [] }}>
              <Button>Menu</Button>
            </Dropdown>
            <Button
              type="primary"
              onClick={() => setAddGroup(true)}
            >
              <PlusOutlined />
              Add Group
            </Button>
          </Space>
        </Col>
        <AddGroupForm addGroup={handleAddGroup} open={addGroup} onClose={() => setAddGroup(false)} />
      </Row>
      {sortedGroups.length === 0
        ? (
          <Empty
            description={I18n.t('administration.scoring.no_groups')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : null}
      {sortedGroups.length > 0 ? (
        <DndContext
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={[...prefixedGroupIds]}
            strategy={rectSortingStrategy}
          >
            <Row
              wrap
              className={cs({ 'p-4 pt-0': sortedGroups.length > 0 })}
            >
              <Col>
                <Space>
                  {sortedGroups.map(group => (
                    <GroupCardSortable
                      items={prefixedFactorIds}
                      key={group.name}
                      sortId={`group_${group.id}`}
                      group={group}
                    />
                  ))}
                </Space>
              </Col>
            </Row>
          </SortableContext>
          {createPortal(
            <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
              {
              // eslint-disable-next-line no-nested-ternary
              activeId ? (
                prefixedGroupIds.includes(activeId) ? (
                  <GroupCard
                    group={getGroupById(groups, getItemIdFromSortingId(activeId), 'id')}
                  />
                ) : null
              ) : null
            }
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      ) : null}
    </Flex>
  )
}
