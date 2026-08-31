import React, { useEffect, useState } from 'react'
import {
  Drawer, Tree, Tooltip, Typography, Space, Tag,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { DirectionalNavigateBackIcon, FullWidthSkeleton } from '~/glint'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SubFactorsForm } from '~/modules/admin/modules/Dimensions/components/SubFactorsForm'
import { SubFactors, SubFactorsTR } from '~/modules/admin/modules/client/core/subFactors'
import { useResources } from '~/hooks/useResources/useResources'
import {
  OccupationConditionSet,
  OccupationConditionSetTR,
} from '~/modules/admin/modules/Dimensions/routes/OccupationConditionSetsList/interfaces'
import { RemoveSubFactorsModal } from '~/modules/admin/modules/Dimensions/components/RemoveSubFactorsModal'

const MODALS = {
  RemoveSubFactorsModal,
}

const { I18n } = window

type FormState = {
  mode: 'edit' | 'add'
  factor?: SubFactors
  conditionSetId: string
}

export const OccupationFactorsDrawer: React.FC<{
  open: boolean; handleClose: () => void; occupationId?: number; occupationName?: string
}> = ({
  open, handleClose, occupationId, occupationName,
}) => {
  const [formState, setFormState] = useState<FormState | null>(null)
  const [factorsByConditionSet, setFactorsByConditionSet] = useState<Record<string, SubFactors[]>>({})
  const [isLoadingFactors, setIsLoadingFactors] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const { dimensionId } = useParams() as { dimensionId: string }
  const dispatch = useDispatch()

  const {
    data: conditionSets,
    fetch: fetchConditionSets,
    isLoading: isConditionSetsLoading,
  } = useResources<OccupationConditionSet>('occupation_condition_sets', {
    basePath: `dimensions/${dimensionId}/`,
    responseType: OccupationConditionSetTR,
  })

  const { fetch: fetchFactors } = useResources<SubFactors>('occupations_factors', {
    basePath: `dimensions/${dimensionId}/occupations/${occupationId}/`,
    responseType: SubFactorsTR,
  })

  const fetchAllFactors = (conditionSetList: OccupationConditionSet[]) => {
    setIsLoadingFactors(true)
    const buildRequest = (cs: OccupationConditionSet) => {
      const filter = { condition_set_id: cs.id }
      return fetchFactors({ apiConfig: { filter } }).then(({ data }) => ({ id: cs.id, data }))
    }
    const requests = conditionSetList.map(buildRequest)
    return Promise.all(requests).then((results) => {
      const grouped: Record<string, SubFactors[]> = {}
      results.forEach(({ id, data }) => { grouped[id] = data })
      setFactorsByConditionSet(grouped)
    }).finally(() => {
      setIsLoadingFactors(false)
    })
  }

  const refreshFactors = () => {
    fetchConditionSets().then(({ data: conditionSetList }) => {
      fetchAllFactors(conditionSetList)
    })
  }

  useEffect(() => {
    if (open) {
      fetchConditionSets().then(({ data: conditionSetList }) => {
        fetchAllFactors(conditionSetList)
      })
    }
  }, [occupationId, open])

  useEffect(() => {
    if (conditionSets.length) {
      setExpandedKeys(conditionSets.map(cs => `cs-${cs.id}`))
    }
  }, [conditionSets])

  const handleRemoveFactor = (factor: SubFactors) => {
    dispatch(openModal('RemoveSubFactorsModal', {
      subFact: factor,
      slug: 'occupations',
      occupationId,
      onSuccessfulRemoval: refreshFactors,
    }))
    if (formState?.factor?.id === factor.id) setFormState(null)
  }

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (!selectedKeys.length) return
    const key = selectedKeys[0] as string

    if (key.startsWith('add-')) {
      const conditionSetId = key.replace('add-', '')
      setFormState({ mode: 'add', conditionSetId })
      return
    }

    const matchEntry = ([, factors]: [string, SubFactors[]]) => factors.some(f => f.id === key)
    const matchingEntry = Object.entries(factorsByConditionSet).find(matchEntry)
    if (matchingEntry) {
      const [csId, factors] = matchingEntry
      const found = factors.find(f => f.id === key)
      setFormState({ mode: 'edit', factor: found, conditionSetId: csId })
    }
  }

  const handleFormSuccess = () => {
    refreshFactors()
    setFormState(null)
  }

  const sortedConditionSets = [...conditionSets].sort(
    (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0),
  )

  const buildTreeData = () => sortedConditionSets.map((cs) => {
    const csFactors = factorsByConditionSet[cs.id] || []
    return {
      key: `cs-${cs.id}`,
      title: (
        <Space>
          {cs.name}
          {cs.isDefault && <Tag color="var(--ant-primary-color)">{I18n.t('admin.default')}</Tag>}
        </Space>
      ),
      selectable: false,
      children: [
        ...csFactors.map(factor => ({
          key: factor.id,
          title: (
            <div className="flex items-center justify-between w-100 pthalf pbhalf">
              <span>{factor.factorName}</span>
              <Tooltip title={I18n.t('shared.remove')}>
                <DeleteOutlined
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemoveFactor(factor)
                  }}
                />
              </Tooltip>
            </div>
          ),
          isLeaf: true,
        })),
        {
          key: `add-${cs.id}`,
          title: (
            <Typography.Link>
              <PlusOutlined />
              {' '}
              {I18n.t('admin.scoring_add_factor')}
            </Typography.Link>
          ),
          isLeaf: true,
        },
      ],
    }
  })

  const editSelectedKeys = formState?.mode === 'edit' && formState.factor ? [formState.factor.id] : []
  const addSelectedKeys = formState?.mode === 'add' ? [`add-${formState.conditionSetId}`] : []
  const selectedKeys = editSelectedKeys.length ? editSelectedKeys : addSelectedKeys

  const transformedFactor = formState?.factor
    ? { ...formState.factor, factorId: String(formState.factor.factorId) }
    : undefined

  const selectedConditionSet = formState
    ? conditionSets.find(cs => cs.id === formState.conditionSetId)
    : undefined

  const contextTitle = formState?.mode === 'add'
    ? `${I18n.t('admin.scoring_add_factor')} • ${selectedConditionSet?.name}`
    : `${I18n.t('admin.scoring_edit_factor')} • ${formState?.factor?.factorName}`

  const isLoading = isConditionSetsLoading('fetch') || isLoadingFactors

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      closeIcon={<DirectionalNavigateBackIcon />}
      title={occupationName}
      width="70%"
    >
      <div className="flex w-100">
        <div
          className="me-8 pe-8 ps-8 border-r-1 overflow-y-auto"
          style={{
            flex: '0 0 360px',
          }}
        >
          {isLoading ? (
            <FullWidthSkeleton height="1.25rem" rows={6} active />
          ) : (
            <Tree
              showLine
              blockNode
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              selectedKeys={selectedKeys}
              treeData={buildTreeData()}
              onSelect={handleTreeSelect}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {formState ? (
            <>
              <div className="mb-6">
                <Typography.Text className="fs-14" type="secondary">
                  {contextTitle}
                </Typography.Text>
              </div>
              <SubFactorsForm
                key={formState.mode === 'add' ? `new-${formState.conditionSetId}` : formState.factor?.id}
                occupationId={occupationId}
                subFact={transformedFactor}
                slug="occupations"
                showSubmitButton
                onStatusChange={() => {}}
                onSuccessfulSubmission={handleFormSuccess}
                occupationConditionSetId={formState.conditionSetId}
              />
            </>
          ) : (
            <Typography.Text
              className="h-100 flex justify-center items-center"
              type="secondary"
            >
              {I18n.t('admin.add_or_select_factor_msg')}
            </Typography.Text>
          )}
        </div>
      </div>
      <Modals modals={MODALS} />
    </Drawer>
  )
}
