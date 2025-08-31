import {
  Button, Descriptions, DescriptionsProps, Flex,
} from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { BaseMeta } from '~/hooks/useResources/interfaces'

const { I18n } = window

interface InviteDetailsProps {
  workshopInvite: WorkshopInvite
  updateWorkshopInvite: () => void
  permissions: BaseMeta['permissions']
}
function InviteDetails ({
  workshopInvite, updateWorkshopInvite, permissions,
}: InviteDetailsProps) {
  const navigate = useNavigate()
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }

  const backUrl = `/admin/projects/${projectId}/new_campaigns/${campaignId}/scheduling/invites`

  const getYesNo = (value: boolean) => (value ? I18n.t('common.text.enabled') : I18n.t('common.text.disabled'))

  const items: DescriptionsProps['items'] = useMemo(() => {
    const baseItems = [
      {
        key: 'title',
        label: 'Title',
        children: workshopInvite?.title,
        span: {
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        },
      },
      {
        key: 'description',
        label: 'Description',
        children: workshopInvite?.description,
        span: {
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        },
      },
      {
        key: 'allowLanguagePreference',
        label: 'Allow Language Preference',
        children: getYesNo(workshopInvite?.allowLanguagePreference),
      },
      {
        key: 'allowNeurodiversityOption',
        label: 'Allow Neurodiversity Option',
        children: getYesNo(workshopInvite?.allowNeurodiversityOption),
      },
      {
        key: 'allowedLanguages',
        label: 'Allowed Languages',
        children: workshopInvite?.allowedLanguages.map(language => I18n.t(`languages.${language}`)).join(', '),
        span: {
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        },
      },
    ]

    if (workshopInvite?.name) {
      baseItems.push({
        key: 'name',
        label: 'Name',
        children: workshopInvite.name,
        span: {
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        },
      })
    }

    return baseItems
  }, [workshopInvite])

  return (
    <>
      <Descriptions
        title={(
          <Flex gap={8}>
            <ArrowLeftOutlined onClick={() => navigate(backUrl)} />
            {workshopInvite?.title}
          </Flex>
          )}
        bordered
        column={{
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        items={items}
        extra={
          permissions?.update && (
            <Button
              size="large"
              onClick={() => updateWorkshopInvite()}
            >
              {I18n.t('common.actions.edit')}
            </Button>
          )
          }
        size="small"
      />
    </>
  )
}

export default InviteDetails
