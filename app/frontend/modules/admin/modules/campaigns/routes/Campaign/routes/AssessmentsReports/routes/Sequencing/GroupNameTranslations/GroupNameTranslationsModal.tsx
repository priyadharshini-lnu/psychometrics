import {
  App,
  Button,
  Col,
  Modal,
  Row,
  Spin,
  Typography,
} from 'antd'

import {
  CampaignAssessmentGroup,
  FetchNameTranslationsResponse,
} from '~/modules/admin/modules/campaigns/core/assessmentGroups'
import { useGroupNameTranslations } from './useGroupNameTranslations'
import { LocaleSelectors } from './LocaleSelectors'
import { GroupRow } from './GroupRow'
import styles from './styles.less'

const { I18n } = window

interface Props {
  groups?: CampaignAssessmentGroup[]
  campaignId?: number
  availableLocales?: string[]
  close: () => void
  fetchNameTranslations?: (
    campaignId: number,
    groupId: number,
    locales: Array<string | null>,
  ) => Promise<{ response: FetchNameTranslationsResponse }>
  updateGroup?: (
    campaignId: number,
    id: number,
    data: Partial<CampaignAssessmentGroup>,
    locale?: string,
  ) => Promise<{ response: CampaignAssessmentGroup }>
  onGroupsUpdated?: (groups: CampaignAssessmentGroup[]) => void
}

type ContentProps = Required<Omit<Props, 'groups' | 'availableLocales'>> & {
  groups: CampaignAssessmentGroup[]
  availableLocales: string[]
}

const GroupNameTranslationsModalContent = ({
  groups,
  campaignId,
  availableLocales,
  close,
  fetchNameTranslations,
  updateGroup,
  onGroupsUpdated,
}: ContentProps) => {
  const { message } = App.useApp()

  const {
    editingLocale,
    referenceLocale,
    sortedGroups,
    groupStates,
    availableNameLocales,
    isLoading,
    hasChanges,
    handleEditingLocaleChange,
    handleReferenceLocaleChange,
    handleNameChange,
    handleSave,
  } = useGroupNameTranslations({
    groups,
    campaignId,
    availableLocales,
    fetchNameTranslations,
    updateGroup,
    onSaveSuccess: (updated) => {
      onGroupsUpdated(updated)
      message.success(I18n.t('shared.updated_successfully'))
      close()
    },
    onSaveError: () => {
      message.error(I18n.t('errors.something_went_wrong'))
    },
  })

  return (
    <Modal
      open
      title={I18n.t('assessments_reports.sequencing.edit_group_name')}
      onCancel={close}
      destroyOnClose
      width={1100}
      footer={(
        <div className="display-flex justify-content-end">
          <Button key="cancel" onClick={close} className="mr8">
            {I18n.t('common.actions.cancel')}
          </Button>
          <Button key="save" type="primary" onClick={handleSave} disabled={!hasChanges}>
            {I18n.t('common.actions.save')}
          </Button>
        </div>
      )}
    >
      <div className={styles.modalBody}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <LocaleSelectors
              editingLocale={editingLocale}
              referenceLocale={referenceLocale}
              availableLocales={availableLocales}
              availableNameLocales={availableNameLocales}
              onEditingLocaleChange={handleEditingLocaleChange}
              onReferenceLocaleChange={handleReferenceLocaleChange}
            />
          </Col>

          {isLoading ? (
            <Col span={24}>
              <div className={styles.loaderWrapper}>
                <Spin />
              </div>
            </Col>
          ) : (
            <>
              <Col span={24}>
                <div className={styles.columnHeaders}>
                  <Typography.Text strong>{I18n.t('shared.name')}</Typography.Text>
                  {referenceLocale && (
                    <Typography.Text strong>
                      {I18n.t('common.text.reference_language')}
                    </Typography.Text>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <div className={styles.groupList}>
                  {sortedGroups.map(group => (
                    <GroupRow
                      key={group.id}
                      currentValue={groupStates[group.id]?.currentValue ?? ''}
                      referenceValue={groupStates[group.id]?.referenceValue ?? ''}
                      referenceLocale={referenceLocale}
                      error={groupStates[group.id]?.error ?? ''}
                      onChange={value => handleNameChange(group.id, value)}
                    />
                  ))}
                </div>
              </Col>
            </>
          )}
        </Row>
      </div>
    </Modal>
  )
}

export const GroupNameTranslationsModal = ({
  groups = [],
  availableLocales = [],
  campaignId,
  close,
  fetchNameTranslations,
  updateGroup,
  onGroupsUpdated,
}: Props) => {
  if (!campaignId || !fetchNameTranslations || !updateGroup || !onGroupsUpdated) {
    return null
  }

  return (
    <GroupNameTranslationsModalContent
      groups={groups}
      campaignId={campaignId}
      availableLocales={availableLocales}
      close={close}
      fetchNameTranslations={fetchNameTranslations}
      updateGroup={updateGroup}
      onGroupsUpdated={onGroupsUpdated}
    />
  )
}
