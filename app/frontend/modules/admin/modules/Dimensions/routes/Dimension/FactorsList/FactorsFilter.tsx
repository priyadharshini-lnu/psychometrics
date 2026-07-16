import { FC } from 'react'
import { Button, Select } from 'antd'
import {
  ImportOutlined,
  PlusOutlined,
  TranslationOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { Factor } from '~/modules/admin/modules/campaigns/core/factors'
import { Resource, useResourceContext } from '~/modules/admin/components/Resource'

type Props = {
  openModal: (modalName: string, modalProps?: unknown) => void
}

const { I18n } = window

const SCORING_STRATEGIES = [
  'questions',
  'sub_factor_questions',
  'sub_factors_average',
  'sub_factors_conditional_average',
  'questions_sum',
  'sub_factor_questions_sum',
  'external_score',
  'questions_percentage',
  'sub_factors_sum',
  'custom_formula',
]

const scoringStrategyOptions = [
  {
    label: I18n.t('administration.any'),
    value: '',
  },
  ...SCORING_STRATEGIES.map(strategy => ({
    label: I18n.t(`admin.${strategy}`),
    value: strategy,
  })).sort((a, b) => a.label.localeCompare(b.label)),
]

export const FactorsFilter: FC<Props> = ({
  openModal,
}) => {
  const { resource } = useResourceContext<Factor>()

  const tableLoading = resource.isLoading('fetch')

  const handleCreateFactorsModal = () => {
    openModal('FactorsFormModal')
  }

  const importFactorsModal = () => {
    openModal('FactorsImportModal')
  }

  const handleTranslationsModal = () => {
    openModal('FactorTranslationsModal')
  }

  const selectedScoringStrategy = resource.getFilteredValue('scoring_strategy_in') as string | undefined
  const handleScoringStrategyFilterChange = (value: string) => {
    resource.changeFilter('scoring_strategy_in', value || undefined)
  }

  return (
    <Resource.Filter
      name="filterable_fields"
      placeholder={I18n.t('shared.search')}
    >
      <Select
        value={selectedScoringStrategy || undefined}
        options={scoringStrategyOptions}
        placeholder={I18n.t('admin.factors_filter_strategy')}
        style={{ minWidth: 260 }}
        onChange={handleScoringStrategyFilterChange}
      />
      <Button type="primary" disabled={tableLoading} onClick={handleCreateFactorsModal}>
        <PlusOutlined />
        {I18n.t('shared.create')}
      </Button>
      <Button disabled={tableLoading} onClick={importFactorsModal}>
        <ImportOutlined />
        {I18n.t('admin.dimensions_import_factors_title')}
      </Button>
      <Button disabled={tableLoading} onClick={handleTranslationsModal}>
        <TranslationOutlined />
        {I18n.t('admin.translations.title')}
      </Button>
    </Resource.Filter>
  )
}
