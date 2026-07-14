import React, { useEffect, useMemo, useState } from 'react'
import {
  Drawer, Tree, Button, Empty, Tooltip, Select, Col, Row, Typography, Space, Tag,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import Modals from '~/modules/admin/components/Modals'
import { FullWidthSkeleton } from '~/glint'
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

export const OccupationFactorsDrawer: React.FC<{
   open: boolean; handleClose: () => void; occupationId?: number; occupationName?: string }> = (
     {
       open, handleClose, occupationId, occupationName,
     },
   ) => {
     const [selectedConditionSetId, setSelectedConditionSetId] = useState<string | null>(null)
     const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null)
     const [isAddingFactor, setIsAddingFactor] = useState(false)
     const { dimensionId } = useParams() as { dimensionId: string }
     const [factorsDataState, setFactorsDataState] = useState<{
       data: SubFactors[], requests: {}, meta: {}, query: {},
     }>({
       data: [], requests: {}, meta: {}, query: {},
     })
     const dispatch = useDispatch()

     const {
       data: occupationsFactors, fetch: fetchOccupationFactors,
       isLoading: isFactorsLoading, changeFilter,
     } = useResources<SubFactors>('occupations_factors', {
       basePath: `dimensions/${dimensionId}/occupations/${occupationId}/`,
       stateManager: { state: factorsDataState, setState: setFactorsDataState },
       responseType: SubFactorsTR,
     })

     const {
       data: conditionSets,
       fetch: fetchConditionSets, isLoading: isConditionSetsLoading,
     } = useResources<OccupationConditionSet>('occupation_condition_sets', {
       basePath: `dimensions/${dimensionId}/`,
       responseType: OccupationConditionSetTR,
     })

     const defaultSet = conditionSets.find(cs => cs.isDefault)

     const currentConditionSetId = selectedConditionSetId
       || defaultSet?.id
       || conditionSets[0]?.id || null

     const clearSelectedFactor = () => {
       selectedFactorId && setSelectedFactorId(null)
       isAddingFactor && setIsAddingFactor(false)
     }

     const selectedFactor = useMemo(
       () => occupationsFactors.find(
         factor => factor.id === selectedFactorId,
       ), [currentConditionSetId, selectedFactorId],
     )
     const transformedSelectedFactor = selectedFactor
       && { ...selectedFactor, factorId: String(selectedFactor.factorId) }

     const showForm = isAddingFactor || !!selectedFactor
     const conditionSetHasOccupationFactors = occupationsFactors && occupationsFactors.length > 0

     useEffect(() => {
       if (open) {
         fetchConditionSets()
         fetchOccupationFactors()
       }
     }, [occupationId, open])

     useEffect(() => {
       if (open && currentConditionSetId) {
         changeFilter('condition_set_id', currentConditionSetId || '')
       }
     }, [currentConditionSetId, open])

     useEffect(() => () => {
       if (!open) {
         setSelectedConditionSetId(null)
         clearSelectedFactor()
       }
     }, [open])

     const handleConditionSetChange = (value: string) => {
       setSelectedConditionSetId(value)
       clearSelectedFactor()
     }

     const handleRemoveFactor = (id: string) => {
       dispatch(openModal('RemoveSubFactorsModal', {
         subFact: occupationsFactors.find(factor => factor.id === id),
         slug: 'occupations',
         occupationId,
         onSuccessfulRemoval: () => {
           fetchOccupationFactors()
         },
       }))
       if (selectedFactorId === id) setSelectedFactorId(null)
     }

     const handleSelectFactor = (selectedKeys) => {
       if (!selectedKeys.length) return
       setIsAddingFactor(false)
       setSelectedFactorId(selectedKeys[0])
     }

     const handleAddFactor = () => {
       setSelectedFactorId(null)
       setIsAddingFactor(true)
     }

     const handleFormClose = (data) => {
       setFactorsDataState({
         ...factorsDataState,
         data: [...factorsDataState.data.filter(factor => factor.id !== data.id), data],
       })
       clearSelectedFactor()
     }

     const treeData = occupationsFactors.map(factor => ({
       key: factor.id,
       title: (
         <div className="flex items-center justify-between w-100">
           <Space>
             <Typography.Text
               style={{
                 background: selectedFactorId === factor.id ? 'transparent' : undefined,
               }}
               code
             >
               {factor.factorId}
             </Typography.Text>
             {factor.factorName}
           </Space>
           <Tooltip title={I18n.t('shared.remove')}>
             <DeleteOutlined
               onClick={(event) => {
                 event.stopPropagation()
                 handleRemoveFactor(factor.id)
               }}
             />
           </Tooltip>
         </div>
       ),
     }))

     const occupationFactorsList = conditionSetHasOccupationFactors ? (
       <Tree
         showLine
         blockNode
         selectedKeys={selectedFactorId ? [selectedFactorId] : []}
         treeData={treeData}
         onSelect={handleSelectFactor}
       />
     ) : (
       <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={I18n.t('admin.empty_occupation_condition_set_msg')} />
     )

     return (
       <Drawer
         open={open}
         onClose={handleClose}
         title={(
           <>
             {occupationName}
             {' '}
             -
             {' '}
             <Tag className="fs-20">{I18n.t('admin.occupation_factors_title')}</Tag>
           </>
)}
         size={960}
       >
         <Row gutter={[24, 0]}>
           <Col span={10} style={{ borderInlineEnd: '1px solid #f0f0f0' }}>
             <label className="mb-2">
               {I18n.t('admin.select_condition_set')}
             </label>
             <Select
               loading={isConditionSetsLoading('fetch')}
               className="w-100 mb-4"
               value={currentConditionSetId}
               onChange={handleConditionSetChange}
               options={conditionSets.map(({ id, name, isDefault }) => ({
                 value: id,
                 label: (
                   <Space className="w-100" styles={{ root: { justifyContent: 'space-between' } }}>
                     {name}
                     {isDefault && (
                       <Tag className="ta-e" color="var(--ant-primary-color)">{I18n.t('admin.default')}</Tag>
                     )}
                   </Space>
                 ),
               }))}
             />
             {isFactorsLoading('fetch') ? (
               <FullWidthSkeleton height="1.25rem" rows={4} active />
             ) : occupationFactorsList}
             <Button
               size="small"
               type="dashed"
               block
               className="mt-4"
               icon={<PlusOutlined />}
               onClick={handleAddFactor}
               style={{ backgroundColor: isAddingFactor ? 'var(--ant-primary-1)' : undefined }}
             >
               {I18n.t('admin.scoring_add_factor')}
             </Button>
           </Col>
           <Col span={14}>
             {showForm ? (
               <SubFactorsForm
                 occupationId={occupationId}
                 key={isAddingFactor ? 'new' : selectedFactorId}
                 subFact={transformedSelectedFactor}
                 slug="occupations"
                 showSubmitButton
                 onStatusChange={() => {}}
                 onSuccessfulSubmission={handleFormClose}
                 occupationConditionSetId={currentConditionSetId}
               />
             ) : (
               <Typography.Text
                 className="h-100 flex justify-center items-center"
                 type="secondary"
               >
                 {I18n.t('admin.add_or_select_factor_msg')}
               </Typography.Text>
             )}
           </Col>
         </Row>
         <Modals modals={MODALS} />
       </Drawer>
     )
   }
