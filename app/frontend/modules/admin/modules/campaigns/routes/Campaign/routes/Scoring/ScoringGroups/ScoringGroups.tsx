import _, { findIndex } from 'lodash'
import * as t from 'io-ts'
import {
  useState, useMemo, useEffect, useRef,
} from 'react'
import { createPortal } from 'react-dom'
import cs from 'classnames'
import {
  Row, Col, Space, Button, Typography, Empty, Flex, App, Tooltip,
} from 'antd'
import {
  DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragEndEvent, DragOverlay, DragStartEvent,
  defaultDropAnimation, MeasuringStrategy, DropAnimation, Active, Over,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useParams } from 'react-router-dom'

import { ConnectedProps, connect } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { Key } from 'antd/es/table/interface'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import {
  CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
} from '~/modules/admin/constants/campaignFactors'
import { AddGroupForm } from './AddGroupForm'
import { AddEditFactorForm } from './AddEditFactorForm'
import { GroupCard, GroupCardSortable, type CampaignFactorGroup } from './GroupCard'
import { Factor, FactorSortable, type CampaignFactor } from './Factor'
import { getGroupById, updateArrayItemsPositionOnIndices, getItemIdFromSortingId } from '~/utils/dnd'
import { ToolsDropdown } from './ToolsDropdown'
import { ManageVariablesForm } from './ManageVariablesForm'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { ImportFactorsForm } from './ImportFactorsForm'
import {
  importFactors, IMPORT,
} from '~/modules/admin/modules/campaigns/core/campaignFactor'
import { isRequestInProgress } from '~/core/request'
import { RemoveCampaignFactorsModal } from './RemoveCampaignFactorsModal'
import { RemoveCampaignFactorModal } from './RemoveCampaignFactorModal'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'

const getFactorsByGroupId = (factors: CampaignFactor[], groupId: string) => factors
  .filter(factor => factor.campaignFactorGroupId === parseInt(groupId, 10))
  .sort((sortedFactorA, sortedFactorB) => sortedFactorA.position - sortedFactorB.position)

const getPrefixFactorIds = (factors: CampaignFactor[]) => factors.map(
  factor => `factor_${factor.id}`,
)

const { I18n } = window

const MODALS = {
  RemoveCampaignFactorsModal,
  RemoveCampaignFactorModal,
}

const connector = connect(
  (state: RootState) => ({
    campaignName: getCurrentCampaign(state).name,
    campaignPermissions: getCurrentCampaign(state).permissions,
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importFactors,
    openModal,
  },
)

type Props = ConnectedProps<typeof connector>;

const ScoringGroupsComponent = (props: Props) => {
  const [addGroup, setAddGroup] = useState(false)
  const [openAddEditFactor, setOpenAddEditFactor] = useState({ open: false, mode: 'add' })
  const [openImportFactorsForm, setOpenImportFactorsForm] = useState(false)
  const [currentGroupId, setCurrentGroupId] = useState<string>('')
  const [currentFactor, setCurrentFactor] = useState<CampaignFactor | undefined>(undefined)
  const [openVariablesForm, setOpenVariablesForm] = useState(false)
  const { campaignId } = useParams() as { campaignId: string }
  const [factorGroupsLocalState, setFactorGroupsLocalState] = useState<CampaignFactorGroup[]>([])
  const [campaignFactorsLocalState, setCampaignFactorsLocalState] = useState<CampaignFactor[]>([])
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))
  const [activeId, setActiveId] = useState<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  const { modal, message } = App.useApp()
  const [modifiedFactors, setModifiedFactors] = useState({})
  const {
    campaignPermissions, importFactors, loading, openModal, campaignName,
  } = props

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
    collectionAction,
  } = useResources<CampaignFactor>(
    'campaign_factors', {
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        include: ['assessment', 'factor', 'dimension'],
        fields: {
          dimensions: ['id', 'name'],
          assessments: ['id', 'name'],
          factors: ['id', 'name'],
        },
        page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE },
      },
    },
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

  const handleOpenEditFactor = (factor: CampaignFactor) => {
    setCurrentFactor(factor)
    setOpenAddEditFactor({ open: true, mode: 'edit' })
  }

  const isFormValid = form => form.isFieldsTouched() && !form.getFieldsError().some(({ errors }) => errors.length > 0)

  const handleFactorSelect = (id: Key[], form) => {
    if (isFormValid(form)) {
      setModifiedFactors((currModifiedFactors) => {
        const newModifiedFactors = { ...currModifiedFactors }
        if (_.isMatch(currentFactor || {}, form.getFieldsValue())) {
          delete newModifiedFactors[currentFactor?.id as string]
        } else {
          newModifiedFactors[currentFactor?.id as string] = form.getFieldsValue()
        }
        return newModifiedFactors
      })
    }
    const factor = campaignFactorsLocalState.find(factor => factor.id === id[0])
    if (factor) {
      handleOpenEditFactor(factor)
    }
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
      fetchAndUpdateFactors()
    })
  }

  const handleAddGroup = (data) => {
    const newGroupPosition = factorGroupsLocalState.length + 1
    const newGroup = {
      ...data,
      position: newGroupPosition,
      campaign: { id: campaignId },
    }

    return createCampaignFactorGroup(newGroup).then(() => {
      fetchAndUpdateFactorGroups()
    })
  }

  const handleGroupNameChange = (value, group) => {
    const payload = {
      ...value,
      position: group.position,
      campaign: { id: campaignId },
    }
    return updateFactorGroup(payload).then(() => {
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

    return addCampaignFactor(newFactor).then(() => {
      fetchAndUpdateFactors()
    })
  }
  const handleEditFactors = (form) => {
    const finalModifiedFactors = {
      ...modifiedFactors,
    }
    if (isFormValid(form)) {
      finalModifiedFactors[currentFactor?.id as string] = form.getFieldsValue()
    }
    const payload: Record<string, unknown>[] = []

    Object.keys(finalModifiedFactors).forEach((key) => {
      const value = finalModifiedFactors[key]
      campaignFactorsLocalState.forEach((factor) => {
        if (factor.id === key) {
          payload.push({
            ...value,
            id: factor.id,
            campaignFactorGroupId: factor.campaignFactorGroupId,
            position: factor.position,
            campaign: { id: campaignId },
            campaignFactorGroup: { id: factor.campaignFactorGroupId.toString() },
          })
        }
      })
    })

    return collectionAction({
      action: 'bulk_update',
      method: 'post',
      body: payload,
      responseType: t.literal('ok'),
    }).then(() => {
      fetchAndUpdateFactors()
      handleFormClose()
      message.success(I18n.t('admin.update_success', { readableResourceName: 'Campaign factors' }))
    })
  }

  const handleFormClose = () => {
    setOpenAddEditFactor({ open: false, mode: openAddEditFactor.mode })
    setCurrentFactor(undefined)
    setModifiedFactors({})
  }

  const handleEditFactor = (data): Promise<void> => {
    const factorData = {
      ...data,
      id: currentFactor?.id,
      position: currentFactor?.position,
      campaignFactorGroupId: currentFactor?.campaignFactorGroupId,
      campaign: { id: campaignId },
      campaignFactorGroup: { id: currentFactor?.campaignFactorGroupId.toString() },
    }

    return updateCampaignFactor(factorData).then(() => {
      fetchAndUpdateFactors()
    })
  }

  const handleConfirmRemoveFactor = (factor: CampaignFactor) => {
    collectionAction({
      action: 'validate_campaign_factor_deletion',
      method: 'get',
      body: { id: factor.id },
      responseType: t.type({ response: t.string }),
    }).then((data: { response: string }) => {
      openModal('RemoveCampaignFactorModal', {
        factor, removeCampaignFactor, fetchAndUpdateFactors, warningMessage: data.response,
      })
    })
  }

  const handleRemoveGroup = (groupId: string) => {
    removeCampaignFactorGroup(groupId).then(() => {
      message.success(I18n.t('admin.scoring_factor_group_removed_successfully'))
      fetchFactorGroups({ apiConfig: { fields: { campaign_factor_groups: ['id', 'name', 'position'] } } }).then(
        ({ data }) => {
          setFactorGroupsLocalState([...data])
        },
      )
    })
  }

  const handleConfirmRemoveFactorGroup = (group: CampaignFactorGroup) => {
    modal.confirm({
      title: I18n.t('admin.scoring_remove_factor_group_confirmation_title'),
      content: I18n.t('admin.scoring_remove_factor_group_confirmation_content', { group_name: group.name }),
      onOk: () => handleRemoveGroup(group.id),
    })
  }


  const handleToolsDropdown = ({ key }) => {
    if (key === 'variables') {
      setOpenVariablesForm(true)
    }
    if (key === 'import_factors') {
      setOpenImportFactorsForm(true)
    }
    if (key === 'export_factors') {
      handleExportFactors()
    }
    if (key === 'remove_all_campaign_factors') {
      handleResetCampaignFactors()
    }
  }

  const handleExportFactors = () => {
    collectionAction({
      action: 'export',
      method: 'post',
      responseType: t.literal('ok'),
    }).then(() => {
      message.success(I18n.t('admin.scoring_factors_exported_successfully'))
    })
  }

  const handleResetCampaignFactors = () => openModal('RemoveCampaignFactorsModal', {
    campaignId, campaignName, fetchAndUpdateFactors, fetchAndUpdateFactorGroups,
  })

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
            <p>{I18n.t('admin.scoring_scoring_description')}</p>
            <Button onClick={initializeGroup} type="primary">{I18n.t('admin.scoring_get_started')}</Button>
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
            {I18n.t('admin.scoring_scoring')}
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            {campaignPermissions.manageCampaignScoring ? <ToolsDropdown onClick={handleToolsDropdown} /> : null}
            <Tooltip title={campaignPermissions.manageCampaignScoring ? ''
              : I18n.t('admin.campaigns_users_no_permission_message')}
            >
              <Button
                type="primary"
                disabled={!campaignPermissions.manageCampaignScoring}
                onClick={() => setAddGroup(true)}
              >
                <PlusOutlined />
                {I18n.t('admin.scoring_add_group')}
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>
      {sortedGroups.length === 0
        ? (
          <Empty
            description={I18n.t('admin.scoring_no_groups')}
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
                  <Col key={`${group.name}-${group.id}`}>
                    <GroupCardSortable
                      items={getPrefixFactorIds(factors)}
                      key={group.name}
                      sortId={`group_${group.id}`}
                      group={group}
                      removeGroup={handleConfirmRemoveFactorGroup}
                      addFactor={(groupId) => {
                        setCurrentGroupId(groupId)
                        setOpenAddEditFactor({ open: true, mode: 'add' })
                      }}
                      hasFactors={!!factors.length}
                      onGroupNameChange={handleGroupNameChange}
                      groupsCount={sortedGroups.length}
                      permissions={campaignPermissions}
                      totalFactors={campaignFactorsLocalState.length}
                    >
                      <SortableContext
                        items={getPrefixFactorIds(factors)}
                        strategy={verticalListSortingStrategy}
                        id={`group_${group.id}`}
                      >
                        <Space className="w-100" orientation="vertical">
                          {factors.map(factor => (
                            <FactorSortable
                              key={factor.id}
                              sortId={`factor_${factor.id}`}
                              factor={factor}
                              removeFactor={handleConfirmRemoveFactor}
                              onEditFactor={handleOpenEditFactor}
                              permissions={campaignPermissions}
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
                    permissions={campaignPermissions}
                    totalFactors={campaignFactorsLocalState.length}
                  >
                    {getFactorsByGroupId(
                      campaignFactorsLocalState, getItemIdFromSortingId(activeId).toString(),
                    ).map(factor => (
                      <Factor
                        key={factor.id}
                        factor={factor}
                        removeFactor={() => {}}
                        onEditFactor={() => {}}
                        permissions={campaignPermissions}
                      />
                    ))}
                  </GroupCard>
                ) : (
                  <Factor
                    factor={campaignFactorsLocalState
                      .find(factor => factor.id === getItemIdFromSortingId(activeId).toString())
                      || {} as CampaignFactor}
                    removeFactor={() => {}}
                    onEditFactor={() => {}}
                    permissions={campaignPermissions}
                  />
                )
              ) : null
            }
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      ) : null}
      <AddGroupForm addGroup={handleAddGroup} open={addGroup} onClose={() => setAddGroup(false)} />
      <AddEditFactorForm
        addFactor={handleAddFactor}
        open={openAddEditFactor.open}
        onClose={handleFormClose}
        factorData={modifiedFactors[currentFactor?.id as string] ?? currentFactor}
        editFactor={handleEditFactor}
        title={openAddEditFactor.mode === 'edit'
          ? I18n.t('admin.scoring_edit_factor') : I18n.t('admin.scoring_add_factor')}
        totalFactors={campaignFactorsLocalState}
        groupName={sortedGroups}
        handleFactorSelect={handleFactorSelect}
        dirtyFactors={modifiedFactors}
        editFactors={handleEditFactors}
      />
      <ManageVariablesForm
        open={openVariablesForm}
        close={() => setOpenVariablesForm(false)}
      />

      <ImportFactorsForm
        campaignId={campaignId}
        importFactors={importFactors}
        open={openImportFactorsForm}
        close={() => setOpenImportFactorsForm(false)}
        loading={loading}
      />
      <Modals modals={MODALS} />
    </Flex>
  )
}

export const ScoringGroups = connector(ScoringGroupsComponent)
