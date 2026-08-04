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
  fetchNameTranslations,
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
import { getGroupById, getItemIdFromSortingId, updateArrayItemsPositionOnIndices } from '~/utils/dnd'
import { AddWorkshopActivityDurationModal } from './AddWorkshopActivityDurationModal'
import Modals from '~/modules/admin/components/Modals'
import { openModal } from '~/modules/admin/core/ui/modals'
import { GroupNameTranslationsModal } from './GroupNameTranslations'

const connecter = connect(
  (state: RootState) => ({
    isAssessmentGroupsLoading: isRequestInProgress(state, FETCH),
    availableLocales: state.config.availableLocales,
  }),
  {
    fetchAssessmentGroups,
    updateGroupPosition,
    updateAssessmentPosition,
    createGroup,
    removeGroup,
    updateGroup,
    fetchNameTranslations,
    openModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connecter>

const GROUP_ID_PREFIX = 'g_'
const ASSESSMENT_ID_PREFIX = 'a_'
const UNGROUPED_ID = 'ungrouped'

const MODALS = {
  AddWorkshopActivityDurationModal,
  GroupNameTranslationsModal,
}

const SequencingComponent: FC<PropsFromRedux> = ({
  fetchAssessmentGroups,
  isAssessmentGroupsLoading,
  updateGroupPosition,
  updateAssessmentPosition,
  createGroup,
  removeGroup,
  updateGroup,
  fetchNameTranslations,
  openModal,
  availableLocales,
}) => {
  const { campaignId } = useParams() as { campaignId: string }
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

  const handleUpdateGroupsFromTranslations = (updatedGroups: CampaignAssessmentGroup[]) => {
    const updatedGroupsById = updatedGroups.reduce((groupMap, currentGroup) => (
      { ...groupMap, [currentGroup.id]: currentGroup }
    ), {})

    unstable_batchedUpdates(() => {
      setGroups(prevGroups => prevGroups.map(group => updatedGroupsById[group.id] || group))
      setPastGroups(prevGroups => prevGroups.map(group => updatedGroupsById[group.id] || group))
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
    setAssessments((prevAssessments) => {
      const otherGroupAssessments: CampaignAssessment[] = prevAssessments.filter(
        assessment => !updatedGroupIdList.includes(assessment.id),
      )
      return [...otherGroupAssessments, ...updatedAssessments]
    })

    const requestPayload = updatedAssessments.map(item => ({
      id: item.id,
      position: item.position,
      campaign_assessment_group_id: item.campaignAssessmentGroupId,
      workshop_activity_duration: item.workshopActivityDuration,
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
    duration: string | number | null,
  ) => {
    let overItems: CampaignAssessment[]
    let activeItems: CampaignAssessment[]
    let overGroupId: number | null
    let activeGroupId: number
    let droppingAsLastUngroupedItem = false
    let overIdPosition: number
    let overAssessmentId: number
    const activeId = active?.id
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
          workshopActivityDuration: typeof (duration) === 'string' ? parseInt(duration, 10) : duration,
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
        workshop_activity_duration: item.workshopActivityDuration || null,
      }),
    )

    return new Promise((resolve, reject) => {
      updateAssessmentPosition(parsedCampaignId, requestPayload)
        .then(({ response }) => {
          resolve('done')
          unstable_batchedUpdates(() => {
            unstable_batchedUpdates(() => {
              setGroups(response.groups)
              setPastGroups(response.groups)
              setAssessments(response.assessments)
              setPastAssessments(response.assessments)
            })
          })
        })
        .catch((errData) => {
          unstable_batchedUpdates(() => {
            setGroups(pastGroups)
            setAssessments(pastAssessments)
            reject(errData)
          })
        })
    })
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    const { id } = active
    setActiveId(id)
    return null
  }

  const handleEditScheduleTime = (assessment: CampaignAssessment, duration) => {
    const updatedAssessment = { ...assessment, workshopActivityDuration: duration }
    const requestPayload: UpdateAssessmentPositionRequest[] = [{
      id: updatedAssessment.id,
      position: updatedAssessment.position,
      campaign_assessment_group_id: updatedAssessment.campaignAssessmentGroupId,
      workshop_activity_duration: updatedAssessment.workshopActivityDuration || null,
    }]
    return new Promise((resolve, reject) => {
      updateAssessmentPosition(parsedCampaignId, requestPayload).then(() => {
        resolve('done')
        unstable_batchedUpdates(() => {
          const updateAssessment = prevAssessments => prevAssessments.map((assessment) => {
            if (assessment.id === updatedAssessment.id) {
              return updatedAssessment
            }
            return assessment
          })
          setAssessments(updateAssessment)
          setPastAssessments(updateAssessment)
        })
      }).catch((errData) => {
        reject(errData)
        unstable_batchedUpdates(() => {
          setAssessments(pastAssessments)
        })
      })
    })
  }

  const handleDropOntoAssessmentCenter = (active, over, overContainer, activeContainer) => {
    openModal('AddWorkshopActivityDurationModal', {
      onAddScheduleTime: duration => handleAssessmentDropInDiffGroup(
        active,
        over,
        overContainer,
        activeContainer,
        duration,
      ),
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const activeId = active?.id
    const overId = over?.id
    if (!overId) {
      return null
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
      const activeAssessment = assessments.find(assessment => assessment.id === getItemIdFromSortingId(active.id))
      const activeItemHasWorkshopDuration = activeAssessment && !!activeAssessment.workshopActivityDuration
      const droppedOntoGroupId = getItemIdFromSortingId(overContainer)
      const groupDroppedOnto = groups.find(group => group.id === droppedOntoGroupId)
      if (groupDroppedOnto?.groupType === 'assessment_center' && !activeItemHasWorkshopDuration) {
        return handleDropOntoAssessmentCenter(active, over, overContainer, activeContainer)
      }
      handleAssessmentDropInDiffGroup(
        active, over, overContainer, activeContainer, activeAssessment?.workshopActivityDuration || null,
      )
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
              const isAssessmentCenterGroup = group.groupType === 'assessment_center'

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
                    onManageTranslations={() => openModal('GroupNameTranslationsModal', {
                      groups: sortedGroups,
                      campaignId: parsedCampaignId,
                      availableLocales,
                      fetchNameTranslations,
                      updateGroup,
                      onGroupsUpdated: handleUpdateGroupsFromTranslations,
                    })}
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
                              onEditScheduleTime={isAssessmentCenterGroup ? () => {
                                openModal('AddWorkshopActivityDurationModal', {
                                  onAddScheduleTime: duration => handleEditScheduleTime(groupedAssessment, duration),
                                  workshopActivityDuration: groupedAssessment.workshopActivityDuration,
                                })
                              } : undefined}
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
            />
          </Col>
        </Row>
        {createPortal(
          <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
            {activeId ? (
              <DragOverlayComponent
                groups={groups}
                activeId={activeId}
                assessments={assessments}
                prefixedGroupWithPrefixedAssessmentIds={prefixedGroupWithPrefixedAssessmentIds}
              />
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
      <Modals modals={MODALS} />
    </section>
  )
}

type DragOverlayComponentProps = {
  groups: CampaignAssessmentGroup[]
  activeId: string
  assessments: CampaignAssessment[]
  prefixedGroupWithPrefixedAssessmentIds: Record<string, string>
}

const DragOverlayComponent:FC<DragOverlayComponentProps> = ({
  groups, activeId, assessments, prefixedGroupWithPrefixedAssessmentIds,
}) => {
  const isGroupOverlay = activeId in prefixedGroupWithPrefixedAssessmentIds
  let activeGroup: CampaignAssessmentGroup | undefined = getGroupById(groups, getItemIdFromSortingId(activeId), 'id')
  let activeAssessment: CampaignAssessment | undefined
  if (!isGroupOverlay) {
    activeAssessment = [...assessments].find((assessment) => {
      const dragIdNum = getItemIdFromSortingId(activeId)
      return assessment.id === dragIdNum
    })
    activeGroup = groups.find(group => group.id === activeAssessment?.campaignAssessmentGroupId)
  }
  const isAssessmentCenter = activeGroup?.groupType === 'assessment_center'

  return (
    <>
      {
        isGroupOverlay && activeGroup ? (
          <GroupedAssessmentContainer
            group={activeGroup}
            assessmentCount={getAssessmentsByGroupId(assessments, getItemIdFromSortingId(activeId)).length}
            isLoading={false}
          >
            {getAssessmentsByGroupId(assessments, getItemIdFromSortingId(activeId)).map(groupedAssessment => (
              <Fragment key={groupedAssessment.id}>
                <Row gutter={[8, 8]}>
                  <Assessment
                    onEditScheduleTime={isAssessmentCenter ? () => null : undefined}
                    span={24}
                    assessment={groupedAssessment}
                  />
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
            onEditScheduleTime={isAssessmentCenter ? () => null : undefined}
          />
        )
      }
    </>
  )
}

const getAssessmentsByGroupId = (assessments: Array<CampaignAssessment>, groupId: number | null) => assessments
  .filter(assessment => assessment.campaignAssessmentGroupId === groupId)
  .sort((sortedAssessmentA, sortedAssessmentB) => sortedAssessmentA.position - sortedAssessmentB.position)

export const Sequencing = connecter(SequencingComponent)
