import findIndex from 'lodash/findIndex'
import pick from 'lodash/pick'
import {
  Fragment, FC, useEffect, useState, useMemo, useRef,
} from 'react'
import { createPortal, unstable_batchedUpdates } from 'react-dom'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router'
import { Row, Col } from 'antd'
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
  Active,
  Over,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  fetch as fetchAssessmentGroups,
  FETCH,
  create as createGroup,
  remove as removeGroup,
  update as updateGroup,
  CampaignAssessment,
  updatePosition as updateGroupPosition,
  updateAssessmentPosition,
  UpdateAssessmentPositionRequest,
  CampaignAssessmentGroup,
} from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { isRequestInProgress } from '~/core/request'

import { UngroupedAssessmentContainer } from './UngroupedAssessmentContainer'
import { GroupSortable } from './GroupSortable'
import { AssessmentSortable } from './AssessmentSortable'
import { AddGroup } from './AddGroup'
import { Assessment } from './Assessment'
import { GroupedAssessmentContainer } from './GroupedAssessmentContainer'

const connecter = connect(
  (state: RootState) => ({
    isAssessmentGroupsLoading: isRequestInProgress(state, FETCH),
  }),
  {
    fetchAssessmentGroups,
    updateGroupPosition,
    updateAssessmentPosition,
    createGroup,
    removeGroup,
    updateGroup,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const GROUP_ID_PREFIX = 'g_'
const ASSESSMENT_ID_PREFIX = 'a_'
const UNGROUPED_ID = 'ungrouped'

const SequencingComponent: FC<PropsFromRedux> = ({
  fetchAssessmentGroups,
  isAssessmentGroupsLoading,
  updateGroupPosition,
  updateAssessmentPosition,
  createGroup,
  removeGroup,
  updateGroup,
}) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const [activeId, setActiveId] = useState<string | null>(null)

  const [groups, setGroups] = useState<Array<CampaignAssessmentGroup>>([])
  const [assessments, setAssessments] = useState<Array<CampaignAssessment>>([])
  const [pastGroups, setPastGroups] = useState<Array<CampaignAssessmentGroup>>([])
  const [pastAssessments, setPastAssessments] = useState<Array<CampaignAssessment>>([])

  const recentlyMovedToNewContainer = useRef(false)

  const unGroupedAssessments = useMemo(() => assessments.filter(
    unGroupedAssessment => unGroupedAssessment.campaignAssessmentGroupId === null,
  ), [assessments])

  const sortedGroups = useMemo(() => groups.sort((groupA, groupB) => groupA.position - groupB.position), [groups])
  const isAssessmentCenterGroup = useMemo(() => sortedGroups.some(
    group => group.groupType === 'assessment_center',
  ), [sortedGroups])

  const prefixedUngroupedAssessmentIds = useMemo(() => (unGroupedAssessments
    .sort((groupA, groupB) => groupA.position - groupB.position)
    .map(unGroupedAssessment => `${ASSESSMENT_ID_PREFIX}${unGroupedAssessment.id}`)), [unGroupedAssessments])

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  }

  const prefixedGroupWithPrefixedAssessmentIds = useMemo(() => (groups.reduce((groupObj, currentGroup) => {
    const prefixedGroupId = `${GROUP_ID_PREFIX}${currentGroup.id}`
    const prefixedAssessments = currentGroup.campaignAssessmentIds.map(
      assessmentId => `${ASSESSMENT_ID_PREFIX}${assessmentId}`,
    )
    return { ...groupObj, [prefixedGroupId]: prefixedAssessments }
  }, {})
  ), [groups])

  const isSortingContainer = activeId ? activeId in prefixedGroupWithPrefixedAssessmentIds : undefined

  useEffect(() => {
    fetchAssessmentGroups(parsedCampaignId).then(({ response }) => {
      unstable_batchedUpdates(() => {
        setGroups(response.groups)
        setPastGroups(response.groups)
        setAssessments(response.assessments)
        setPastAssessments(response.assessments)
      })
    })
  }, [campaignId])

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [prefixedGroupWithPrefixedAssessmentIds])

  const findContainer = (id: string) => {
    if (id in prefixedGroupWithPrefixedAssessmentIds) {
      return id
    }
    if (prefixedUngroupedAssessmentIds.includes(id) || id === UNGROUPED_ID) {
      return UNGROUPED_ID
    }
    return Object.keys(prefixedGroupWithPrefixedAssessmentIds).find(
      key => prefixedGroupWithPrefixedAssessmentIds[key].includes(id),
    )
  }

  const handleAddGroup = (groupType: string) => {
    createGroup(parsedCampaignId, groups.length + 1, groupType).then(({ response }) => {
      unstable_batchedUpdates(() => {
        setGroups(prevGroups => [...prevGroups, response])
        setPastGroups(prevGroups => [...prevGroups, response])
      })
    })
  }
  const getUpdatedGroups = (groups: CampaignAssessmentGroup[], modifiedGroup: CampaignAssessmentGroup) => (
    groups.map(group => (group.id === modifiedGroup.id ? modifiedGroup : group))
  )
  const handleUpdateGroup = (groupId: number, data: Partial<CampaignAssessmentGroup>) => {
    updateGroup(parsedCampaignId, groupId, data).then(({ response }) => {
      unstable_batchedUpdates(() => {
        setGroups(prevGroups => getUpdatedGroups(prevGroups, response))
        setPastGroups(prevGroups => getUpdatedGroups(prevGroups, response))
      })
    })
  }

  const handleRemoveGroup = (groupId: number) => {
    unstable_batchedUpdates(() => {
      setGroups(prevGroups => prevGroups.filter(item => item.id !== groupId))
      setAssessments(prevAssessments => prevAssessments.map(assessment => (
        assessment.campaignAssessmentGroupId === groupId
          ? { ...assessment, campaignAssessmentGroupId: null } : assessment
      )))
    })
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
    const updatedGroups: Array<CampaignAssessmentGroup> = updateArrayItemsPositionOnIndices(
      rearrangedGroups,
      'position',
    )
    const updatedGroupsRequestPayload = updatedGroups.map(group => pick(group, ['id', 'position']))

    setGroups(updatedGroups)

    updateGroupPosition(parsedCampaignId, updatedGroupsRequestPayload).then(({ response }) => {
      unstable_batchedUpdates(() => {
        setGroups(response.groups)
        setPastGroups(response.groups)
        setAssessments(response.assessments)
        setPastAssessments(response.assessments)
      })
    })
    return null
  }

  const getOverPos = (overId: string, overItems: CampaignAssessment[], droppingAsLastUngroupedItem?: boolean) => {
    if (overId.startsWith(GROUP_ID_PREFIX) || droppingAsLastUngroupedItem) {
      return overItems.length + 1
    }
    const overAssessmentId = getItemIdFromSortingId(overId)
    return findIndex(overItems, item => item.id === overAssessmentId) + 1
  }

  const handleAssessmentDropInSameGroup = (activeId: string, overId: string, overContainer: string) => {
    let overItems: CampaignAssessment[]
    let overGroupId: number | null
    const activeAssessmentId = getItemIdFromSortingId(activeId)

    if (overContainer === UNGROUPED_ID) {
      overItems = unGroupedAssessments
      overGroupId = null
    } else {
      overGroupId = getItemIdFromSortingId(overContainer)
      overItems = getAssessmentsByGroupId(assessments, overGroupId)
    }
    const activePos = findIndex(overItems, item => item.id === activeAssessmentId) + 1
    const overPos = getOverPos(overId, overItems)
    const rearrangedAssessements = arrayMove(overItems, activePos - 1, overPos - 1)
    const updatedAssessments: CampaignAssessment[] = updateArrayItemsPositionOnIndices(
      rearrangedAssessements,
      'position',
    )
    const updatedGroupIdList = updatedAssessments.map(item => item.id)
    setAssessments((prevAsessments) => {
      const otherGroupAssessments: CampaignAssessment[] = prevAsessments.filter(
        assessment => !updatedGroupIdList.includes(assessment.id),
      )
      return [...otherGroupAssessments, ...updatedAssessments]
    })

    const requestPayload = updatedAssessments.map(item => ({
      id: item.id,
      position: item.position,
      campaign_assessment_group_id: item.campaignAssessmentGroupId,
    }))

    updateAssessmentPosition(parsedCampaignId, requestPayload)
      .then(({ response }) => {
        unstable_batchedUpdates(() => {
          setGroups(response.groups)
          setPastGroups(response.groups)
          setAssessments(response.assessments)
          setPastAssessments(response.assessments)
        })
      })
      .catch(() => {
        unstable_batchedUpdates(() => {
          setGroups(pastGroups)
          setAssessments(pastAssessments)
        })
      })
    return null
  }

  const handleAssessmentDropInDiffGroup = (
    active: Active,
    over: Over | null,
    overContainer: string,
    activeContainer: string,
  ) => {
    let overItems: CampaignAssessment[]
    let activeItems: CampaignAssessment[]
    let overGroupId: number | null
    let activeGroupId: number
    let droppingAsLastUngroupedItem = false
    let overIdPosition: number
    let overAssessmentId: number
    const activeId = active.id
    const overId = over?.id
    const activeAssessmentId = getItemIdFromSortingId(activeId)

    if (overId && overContainer === UNGROUPED_ID) {
      overItems = unGroupedAssessments
      overAssessmentId = getItemIdFromSortingId(overId)
      overIdPosition = findIndex(overItems, item => item.id === overAssessmentId) + 1
      droppingAsLastUngroupedItem = overIdPosition < overItems.length
    } else {
      overGroupId = getItemIdFromSortingId(overContainer)
      overItems = getAssessmentsByGroupId(assessments, overGroupId)
    }
    if (activeContainer === UNGROUPED_ID) {
      activeItems = unGroupedAssessments
    } else {
      activeGroupId = getItemIdFromSortingId(activeContainer)
      activeItems = getAssessmentsByGroupId(assessments, activeGroupId)
    }
    const activePos = findIndex(activeItems, item => item.id === activeAssessmentId) + 1
    const overPos = getOverPos(overId || '', overItems, droppingAsLastUngroupedItem)
    const updatedActiveItems: CampaignAssessment[] = activeItems.map((item, index) => {
      const currentPosition = index + 1
      if (item.id === activeAssessmentId) {
        return {
          ...item,
          campaignAssessmentGroupId: overContainer === UNGROUPED_ID ? null : overGroupId,
          position: overPos,
        }
      }
      if (currentPosition >= activePos) {
        return { ...item, position: index }
      }
      return { ...item, position: currentPosition }
    })
    const updatedOverItems: CampaignAssessment[] = overItems.map((item, index) => {
      const currentPosition = index + 1
      if (currentPosition >= overPos) {
        return { ...item, position: currentPosition + 1 }
      }
      return { ...item, position: currentPosition }
    })
    const updatedGroupIdList = [...updatedActiveItems, ...updatedOverItems].map(item => item.id)
    recentlyMovedToNewContainer.current = true

    unstable_batchedUpdates(() => {
      setGroups(prevGroups => (
        prevGroups.map((group) => {
          if (activeGroupId === group.id) {
            return { ...group, campaignAssessmentIds: [...group.campaignAssessmentIds, activeAssessmentId] }
          }
          if (overGroupId === group.id) {
            const updatedCampaignAssessmentIds = group.campaignAssessmentIds.filter(id => id !== activeAssessmentId)
            return { ...group, campaignAssessmentIds: updatedCampaignAssessmentIds }
          }
          return group
        })
      ))
      setAssessments((prevAssessments) => {
        const updatedAssessments = prevAssessments.filter(
          assessment => !updatedGroupIdList.includes(assessment.id),
        )
        return [...updatedAssessments, ...updatedActiveItems, ...updatedOverItems]
      })
    })

    const requestPayload: UpdateAssessmentPositionRequest[] = [...updatedActiveItems, ...updatedOverItems].map(
      item => ({
        id: item.id,
        position: item.position,
        campaign_assessment_group_id: item.campaignAssessmentGroupId,
      }),
    )

    updateAssessmentPosition(parsedCampaignId, requestPayload)
      .then(({ response }) => {
        unstable_batchedUpdates(() => {
          unstable_batchedUpdates(() => {
            setGroups(response.groups)
            setPastGroups(response.groups)
            setAssessments(response.assessments)
            setPastAssessments(response.assessments)
          })
        })
      })
      .catch(() => {
        unstable_batchedUpdates(() => {
          setGroups(pastGroups)
          setAssessments(pastAssessments)
        })
      })
    return null
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const { id } = active
    setActiveId(id)
    return null
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const activeId = active?.id
    const overId = over?.id
    if (!overId) {
      return null
    }

    if (isAssessmentCenterGroup) {
      const droppedOntoGroupId = getItemIdFromSortingId(overId)
      const groupDroppedOnto = groups.find(group => group.id === droppedOntoGroupId)
      if (groupDroppedOnto?.groupType === 'assessment_center') {
        return null
      }
    }

    if (active.id in prefixedGroupWithPrefixedAssessmentIds && overId) {
      handleGroupDragnDrop(activeId, overId)
      return null
    }

    const overContainer = findContainer(overId)
    const activeContainer = findContainer(active.id)
    if (!overContainer || !activeContainer) {
      return null
    }

    if (activeContainer === overContainer) {
      handleAssessmentDropInSameGroup(activeId, overId, overContainer)
      return null
    }

    if (activeContainer !== overContainer) {
      handleAssessmentDropInDiffGroup(active, over, overContainer, activeContainer)
    }
    return null
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <section className="pt-4 pb-4 ps-4 pe-4">
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
        <Row gutter={[24, 24]} justify="start">
          <SortableContext
            items={[UNGROUPED_ID, ...Object.keys(prefixedGroupWithPrefixedAssessmentIds)]}
            strategy={rectSortingStrategy}
          >
            <UngroupedAssessmentContainer
              isLoading={isAssessmentGroupsLoading}
              count={prefixedUngroupedAssessmentIds?.length ?? 0}
              sortId={UNGROUPED_ID}
              items={prefixedUngroupedAssessmentIds}
            >
              <SortableContext items={prefixedUngroupedAssessmentIds} strategy={rectSortingStrategy} id={UNGROUPED_ID}>
                {unGroupedAssessments.map(ungroupedAssessment => (
                  <AssessmentSortable
                    sortId={`${ASSESSMENT_ID_PREFIX}${ungroupedAssessment.id}`}
                    assessment={ungroupedAssessment}
                    key={ungroupedAssessment.id}
                    span={8}
                  />
                ))}
              </SortableContext>
            </UngroupedAssessmentContainer>
            {sortedGroups.map((group) => {
              const groupedAssessments = getAssessmentsByGroupId(assessments, group.id)
              const sortedGroupedAssessments = groupedAssessments.sort(
                (groupA, groupB) => groupA.position - groupB.position,
              )
              const prefixedAssessmentIds = sortedGroupedAssessments.map(
                groupedAssessment => `${ASSESSMENT_ID_PREFIX}${groupedAssessment.id}`,
              )

              return (
                <Col xs={24} sm={24} md={12} lg={8} key={group.id}>
                  <GroupSortable
                    sortId={`${GROUP_ID_PREFIX}${group.id}`}
                    group={group}
                    items={prefixedAssessmentIds}
                    assessmentCount={groupedAssessments.length}
                    isLoading={isAssessmentGroupsLoading}
                    removeGroup={groupId => removeGroup(parsedCampaignId, groupId)}
                    modifyGroup={(groupdId: number, data: Partial<CampaignAssessmentGroup>) => handleUpdateGroup(
                      groupdId, data,
                    )}
                    updateAssessmentGroups={groupId => handleRemoveGroup(groupId)}
                  >
                    <SortableContext
                      items={prefixedAssessmentIds}
                      strategy={verticalListSortingStrategy}
                      id={`${GROUP_ID_PREFIX}${group.id}`}
                    >
                      {sortedGroupedAssessments.map(groupedAssessment => (
                        <Fragment key={groupedAssessment.id}>
                          <Row gutter={[8, 8]} key={groupedAssessment.id}>
                            <AssessmentSortable
                              disabled={isSortingContainer}
                              span={24}
                              sortId={`${ASSESSMENT_ID_PREFIX}${groupedAssessment.id}`}
                              assessment={groupedAssessment}
                              key={groupedAssessment.id}
                            />
                          </Row>
                          <br />
                        </Fragment>
                      ))}
                    </SortableContext>
                  </GroupSortable>
                </Col>
              )
            })}
          </SortableContext>
          <Col xs={24} sm={24} md={12} lg={8}>
            <AddGroup
              addNewGroup={handleAddGroup}
              hideAddAssessmentCenterBtn={!isAssessmentCenterGroup}
            />
          </Col>
        </Row>
        {createPortal(
          <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
            {
              // eslint-disable-next-line no-nested-ternary
              activeId ? (
                activeId in prefixedGroupWithPrefixedAssessmentIds ? (
                  <GroupedAssessmentContainer
                    campaignId={parsedCampaignId}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    group={getGroupById(groups, getItemIdFromSortingId(activeId))}
                    assessmentCount={getAssessmentsByGroupId(assessments, getItemIdFromSortingId(activeId)).length}
                    isLoading={false}
                  >
                    {getAssessmentsByGroupId(assessments, getItemIdFromSortingId(activeId)).map(groupedAssessment => (
                      <Fragment key={groupedAssessment.id}>
                        <Row gutter={[8, 8]}>
                          <Assessment span={24} assessment={groupedAssessment} />
                        </Row>
                        <br />
                      </Fragment>
                    ))}
                  </GroupedAssessmentContainer>
                ) : (
                  <Assessment
                    assessment={[...assessments].find((assessment) => {
                      const dragIdNum = getItemIdFromSortingId(activeId)
                      return assessment.id === dragIdNum
                    })}
                  />
                )
              ) : null
            }
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </section>
  )
}

const updateArrayItemsPositionOnIndices = <T, >(inputArray: Array<T>, field: keyof T): Array<T> => inputArray
  .map((item, index: number) => ({ ...item, [field]: index + 1 }))

const getAssessmentsByGroupId = (assessments: Array<CampaignAssessment>, groupId: number | null) => assessments
  .filter(assessment => assessment.campaignAssessmentGroupId === groupId)
  .sort((sortedAssessmentA, sortedAssessmentB) => sortedAssessmentA.position - sortedAssessmentB.position)

const getGroupById = (groups: Array<CampaignAssessmentGroup>, groupId: number) => groups
  .find(group => group.id === groupId)

export const getItemIdFromSortingId = (sortingId: string): number => {
  const [, id] = sortingId.split('_')
  return parseInt(id, 10)
}

export const Sequencing = connecter(SequencingComponent)
