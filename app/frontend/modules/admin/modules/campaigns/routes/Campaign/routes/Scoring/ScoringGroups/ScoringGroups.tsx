import _, { findIndex } from 'lodash'
import {
  useState, useMemo, useEffect, useRef,
} from 'react'
import { createPortal } from 'react-dom'
import cs from 'classnames'
import {
  Row, Col, Space, Button, Typography, Dropdown, Empty, Flex,
} from 'antd'
import {
  DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragEndEvent, DragOverlay, DragStartEvent,
  defaultDropAnimation, MeasuringStrategy, DropAnimation, Active, Over,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'

import { useResources } from '~/hooks/useResources'
import { AddGroupForm } from './AddGroupForm'
import { AddEditFactorForm } from './AddEditFactorForm'
import { GroupCard, GroupCardSortable, type CampaignFactorGroup } from './GroupCard'
import { Factor, FactorSortable, type CampaignFactor } from './Factor'
import { getGroupById, updateArrayItemsPositionOnIndices, getItemIdFromSortingId } from '~/utils/dnd'

const getFactorsByGroupId = (factors: CampaignFactor[], groupId: string) => factors
  .filter(factor => factor.campaignFactorGroupId === parseInt(groupId, 10))
  .sort((sortedFactorA, sortedFactorB) => sortedFactorA.position - sortedFactorB.position)

const getPrefixFactorIds = (factors: CampaignFactor[]) => factors.map(
  factor => `factor_${factor.id}`,
)

const { I18n } = window

export const ScoringGroups = () => {
  const [addGroup, setAddGroup] = useState(false)
  const [openAddEditFactor, setOpenAddEditFactor] = useState(false)
  const [currentGroupId, setCurrentGroupId] = useState<string>('')
  const { campaignId } = useParams<{campaignId: string}>()
  const [factorGroupsLocalState, setFactorGroupsLocalState] = useState<CampaignFactorGroup[]>([])
  const [campaignFactorsLocalState, setCampaignFactorsLocalState] = useState<CampaignFactor[]>([])
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))
  const [activeId, setActiveId] = useState<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)

  const {
    createResource: initializeScoring,
  } = useResources('initialize_scoring',
    { basePath: `campaigns/${campaignId}/campaign_factor_groups` })

  const {
    fetch: fetchFactorGroups, isLoading: factorGroupsLoading, updateResource: updateFactorGroup,
    createResource: createCampaignFactorGroup, removeResource: removeCampaignFactorGroup,
  } = useResources<CampaignFactorGroup>('campaign_factor_groups',
    { basePath: `campaigns/${campaignId}`, apiConfig: { include: ['campaign'], fields: { campaign: ['id'] } } })

  const {
    createResource: updateFactorGroupPosition,
  } = useResources('update_positions',
    { basePath: `campaigns/${campaignId}/campaign_factor_groups` })

  const {
    data: campaignFactors,
    fetch: fetchCampaignFactors, createResource: addCampaignFactor,
    removeResource: removeCampaignFactor,
    updateResource: updateCampaignFactor,
  } = useResources<CampaignFactor>(
    'campaign_factors', { basePath: `campaigns/${campaignId}` },
  )

  const {
    createResource: updateCampaignFactorPosition,
  } = useResources(
    'update_positions', { basePath: `campaigns/${campaignId}/campaign_factors` },
  )

  const prefixedGroupIds = factorGroupsLocalState.map(group => `group_${group.id}`)

  const sortedGroups = useMemo(() => {
    const sorted = [...factorGroupsLocalState].sort((a, b) => a.position - b.position)
    return sorted
  }, [factorGroupsLocalState])

  const prefixedGroupWithPrefixedFactorIds = useMemo(() => (
    factorGroupsLocalState.reduce((groupObj, currentGroup) => {
      const prefixedGroupId = `group_${currentGroup.id}`
      const prefixedCampaignFactors = getFactorsByGroupId(campaignFactorsLocalState, currentGroup.id).map(
        factor => `factor_${factor.id}`,
      )
      return { ...groupObj, [prefixedGroupId]: prefixedCampaignFactors }
    }, {})
  ), [factorGroupsLocalState, campaignFactorsLocalState])

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  }

  const fetchAndUpdateFactorGroups = () => {
    fetchFactorGroups({ apiConfig: { fields: { campaign_factor_groups: ['id', 'name', 'position'] } } }).then(
      ({ data }) => {
        setFactorGroupsLocalState([...data])
      },
    )
  }
  const fetchAndUpdateFactors = () => {
    fetchCampaignFactors().then(({ data }) => {
      setCampaignFactorsLocalState([...data])
    })
  }

  useEffect(() => {
    fetchAndUpdateFactorGroups()
    fetchAndUpdateFactors()
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [prefixedGroupWithPrefixedFactorIds])

  const getOverPos = (overId: string, overItems: CampaignFactor[], droppingAsLastUngroupedItem?: boolean) => {
    if (overId.startsWith('group') || droppingAsLastUngroupedItem) {
      return overItems.length + 1
    }
    const overFactorId = getItemIdFromSortingId(overId).toString()
    return findIndex(overItems, item => item.id === overFactorId) + 1
  }

  const findContainer = (id: string) => {
    if (id in prefixedGroupWithPrefixedFactorIds) {
      return id
    }
    return Object.keys(prefixedGroupWithPrefixedFactorIds).find(
      key => prefixedGroupWithPrefixedFactorIds[key].includes(id),
    )
  }

  const handleGroupDragnDrop = (activeId: string, overId: string) => {
    const droppedGroupId = getItemIdFromSortingId(activeId).toString()
    const droppedGroup = factorGroupsLocalState.find(group => group.id === droppedGroupId)
    const droppedOntoGroupId = getItemIdFromSortingId(overId).toString()
    const groupDroppedOnto = factorGroupsLocalState.find(group => group.id === droppedOntoGroupId)
    if (groupDroppedOnto === undefined || droppedGroup === undefined) {
      return null
    }
    const rearrangedGroups = arrayMove(factorGroupsLocalState, droppedGroup.position - 1, groupDroppedOnto.position - 1)
    const updatedGroups = updateArrayItemsPositionOnIndices(
      rearrangedGroups,
      'position',
    )

    setFactorGroupsLocalState(updatedGroups)

    const updatedGroupsRequestPayload = updatedGroups.map(group => _.pick(group, ['id', 'position']))

    updateFactorGroupPosition(updatedGroupsRequestPayload).then(() => {
      fetchAndUpdateFactorGroups()
    })
    return null
  }

  const handleFactorDropInSameGroup = (activeId: string, overId: string, overContainer: string) => {
    const activeFactortId = getItemIdFromSortingId(activeId).toString()
    const overGroupId = getItemIdFromSortingId(overContainer).toString()
    const overItems = getFactorsByGroupId(campaignFactorsLocalState, overGroupId)
    const activePos = findIndex(overItems, item => item.id === activeFactortId) + 1
    const overPos = getOverPos(overId, overItems)
    const rearrangedFactors = arrayMove(overItems, activePos - 1, overPos - 1)
    const updatedFactors: CampaignFactor[] = updateArrayItemsPositionOnIndices(
      rearrangedFactors,
      'position',
    )
    const updatedGroupIdList = updatedFactors.map(item => item.id)
    setCampaignFactorsLocalState((prevFactors) => {
      const otherGroupFactors: CampaignFactor[] = prevFactors.filter(
        factor => !updatedGroupIdList.includes(factor.id),
      )
      return [...otherGroupFactors, ...updatedFactors]
    })

    const requestPayload = updatedFactors.map(item => ({
      id: item.id,
      position: item.position,
      campaignFactorGroupId: item.campaignFactorGroupId,
    }))

    updateCampaignFactorPosition(requestPayload).then(() => {
      fetchAndUpdateFactors()
    })

    return null
  }

  const handleFactorDropInDiffGroup = (
    active: Active,
    over: Over | null,
    overContainer: string,
    activeContainer: string,
  ) => {
    let overItems: CampaignFactor[] = []
    let overGroupId: string | null = ''
    const droppingAsLastUngroupedItem = false
    const activeId = active.id
    const overId = over?.id
    const activeFactorId = getItemIdFromSortingId(activeId).toString()
    const activeGroupId = getItemIdFromSortingId(activeContainer).toString()
    const activeItems = getFactorsByGroupId(campaignFactorsLocalState, activeGroupId)

    if (overId) {
      overGroupId = getItemIdFromSortingId(overContainer).toString()
      overItems = getFactorsByGroupId(campaignFactorsLocalState, overGroupId)
    }

    const activePos = findIndex(activeItems, item => item.id === activeFactorId) + 1
    const overPos = getOverPos(overId || '', overItems, droppingAsLastUngroupedItem)
    const updatedActiveItems: CampaignFactor[] = activeItems.map((item, index) => {
      const currentPosition = index + 1
      if (item.id === activeFactorId) {
        return {
          ...item,
          campaignFactorGroupId: parseInt(overGroupId || '', 10),
          position: overPos,
        }
      }
      if (currentPosition >= activePos) {
        return { ...item, position: index }
      }
      return { ...item, position: currentPosition }
    })
    const updatedOverItems: CampaignFactor[] = overItems.map((item, index) => {
      const currentPosition = index + 1
      if (currentPosition >= overPos) {
        return { ...item, position: currentPosition + 1 }
      }
      return { ...item, position: currentPosition }
    })
    const updatedGroupIdList = [parseInt(overGroupId || '', 10), parseInt(activeGroupId, 10)]
    recentlyMovedToNewContainer.current = true

    setCampaignFactorsLocalState((prevFactors) => {
      const untouchedFactors = prevFactors.filter(
        factor => !updatedGroupIdList.includes(factor.campaignFactorGroupId),
      )

      return [...untouchedFactors, ...updatedActiveItems, ...updatedOverItems]
    })

    const untouchedFactors = campaignFactors.filter(
      factor => !updatedGroupIdList.includes(factor.campaignFactorGroupId),
    )
    const requestPayload = [...updatedActiveItems, ...updatedOverItems, ...untouchedFactors].map(
      item => ({
        id: item.id,
        position: item.position,
        campaignFactorGroupId: item.campaignFactorGroupId,
        campaignFactorGroup: { id: item.campaignFactorGroupId },
        campaign: { id: campaignId },
        name: item.name,
        code: item.code,
      }),
    )

    updateCampaignFactorPosition(requestPayload).then(() => {
      fetchAndUpdateFactors()
    })

    return null
  }

  const initializeGroup = () => {
    initializeScoring('').then(() => {
      fetchAndUpdateFactorGroups()
    })
  }

  const handleAddGroup = (data) => {
    const newGroupPosition = factorGroupsLocalState.length + 1
    const newGroup = {
      ...data,
      position: newGroupPosition,
      campaign: { id: campaignId },
    }

    createCampaignFactorGroup(newGroup).then(() => {
      fetchAndUpdateFactorGroups()
    })
  }

  const handleGroupNameChange = (value, group) => {
    const payload = {
      id: group.id,
      name: value,
      position: group.position,
      campaign: { id: campaignId },
    }
    updateFactorGroup(payload).then(() => {
      fetchAndUpdateFactorGroups()
    })
  }

  const handleAddFactor = (data) => {
    const factorsInGroup = getFactorsByGroupId(campaignFactorsLocalState, currentGroupId)
    const newFactorPosition = factorsInGroup.length + 1
    const newFactor = {
      ...data,
      campaignFactorGroupId: parseInt(currentGroupId, 10),
      position: newFactorPosition,
      campaign: { id: campaignId },
      campaignFactorGroup: { id: currentGroupId },
    }

    addCampaignFactor(newFactor).then(() => {
      fetchAndUpdateFactors()
    })
  }

  const handleEditFactor = (data, factor: CampaignFactor) => {
    const factorData = {
      ...data,
      id: factor.id,
      position: factor.position,
      campaignFactorGroupId: factor.campaignFactorGroupId,
      campaign: { id: campaignId },
      campaignFactorGroup: { id: factor.campaignFactorGroupId.toString() },
    }

    updateCampaignFactor(factorData).then(() => {
      fetchAndUpdateFactors()
    })
  }

  const handleRemoveFactor = (factorId: string) => {
    removeCampaignFactor(factorId).then(() => {
      fetchAndUpdateFactors()
    })
  }

  const handleRemoveGroup = (groupId: string) => {
    removeCampaignFactorGroup(groupId).then(() => {
      fetchFactorGroups({ apiConfig: { fields: { campaign_factor_groups: ['id', 'name', 'position'] } } }).then(
        ({ data }) => {
          setFactorGroupsLocalState([...data])
        },
      )
    })
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

    const overContainer = findContainer(overId)
    const activeContainer = findContainer(activeId)
    if (!overContainer || !activeContainer) {
      return null
    }

    if (activeContainer === overContainer) {
      handleFactorDropInSameGroup(activeId, overId, overContainer)
      return null
    }

    if (activeContainer !== overContainer) {
      handleFactorDropInDiffGroup(active, over, overContainer, activeContainer)
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


  if (!factorGroupsLoading('fetch') && sortedGroups.length === 0) {
    return (
      <div className="justify-center items-center flex" style={{ height: '100vh' }}>
        <div>
          <div className="ta-c">
            <p>{I18n.t('administration.scoring.scoring_description')}</p>
            <Button onClick={initializeGroup} type="primary">{I18n.t('administration.scoring.get_started')}</Button>
          </div>
        </div>
      </div>
    )
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
            {I18n.t('administration.scoring.scoring')}
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
              {I18n.t('administration.scoring.add_group')}
            </Button>
          </Space>
        </Col>
        <AddGroupForm addGroup={handleAddGroup} open={addGroup} onClose={() => setAddGroup(false)} />
        <AddEditFactorForm
          addFactor={handleAddFactor}
          open={openAddEditFactor}
          onClose={() => setOpenAddEditFactor(false)}
        />
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
              gutter={[16, 16]}
              wrap
              className={cs({ 'p-4 pt-0': sortedGroups.length > 0 })}
            >
              {sortedGroups.map((group) => {
                const factors = getFactorsByGroupId(campaignFactorsLocalState, group.id)
                return (
                  <Col>
                    <GroupCardSortable
                      items={getPrefixFactorIds(factors)}
                      key={group.name}
                      sortId={`group_${group.id}`}
                      group={group}
                      removeGroup={handleRemoveGroup}
                      addFactor={(groupId) => {
                        setCurrentGroupId(groupId)
                        setOpenAddEditFactor(true)
                      }}
                      hasFactors={!!factors.length}
                      onGroupNameChange={handleGroupNameChange}
                      groupsCount={sortedGroups.length}
                    >
                      <SortableContext
                        items={getPrefixFactorIds(factors)}
                        strategy={verticalListSortingStrategy}
                        id={`group_${group.id}`}
                      >
                        <Space className="w-100" direction="vertical">
                          {factors.map(factor => (
                            <FactorSortable
                              key={factor.id}
                              sortId={`factor_${factor.id}`}
                              factor={factor}
                              removeFactor={handleRemoveFactor}
                              editFactor={handleEditFactor}
                            />
                          ))}
                        </Space>
                      </SortableContext>
                    </GroupCardSortable>
                  </Col>
                )
              })}
            </Row>
          </SortableContext>
          {createPortal(
            <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
              {
              // eslint-disable-next-line no-nested-ternary
              activeId ? (
                prefixedGroupIds.includes(activeId) ? (
                  <GroupCard
                    group={getGroupById(factorGroupsLocalState, getItemIdFromSortingId(activeId).toString(), 'id')}
                    removeGroup={() => {}}
                    hasFactors={getFactorsByGroupId(campaignFactorsLocalState,
                      getItemIdFromSortingId(activeId).toString()).length > 0}
                    addFactor={() => {}}
                    groupsCount={sortedGroups.length}
                  >
                    {getFactorsByGroupId(
                      campaignFactorsLocalState, getItemIdFromSortingId(activeId).toString(),
                    ).map(factor => (
                      <Factor
                        key={factor.id}
                        factor={factor}
                        removeFactor={() => {}}
                        editFactor={() => {}}
                      />
                    ))}
                  </GroupCard>
                ) : (
                  <Factor
                    factor={campaignFactorsLocalState
                      .find(factor => factor.id === getItemIdFromSortingId(activeId).toString())
                      || {} as CampaignFactor}
                    removeFactor={() => {}}
                    editFactor={() => {}}
                  />
                )
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
