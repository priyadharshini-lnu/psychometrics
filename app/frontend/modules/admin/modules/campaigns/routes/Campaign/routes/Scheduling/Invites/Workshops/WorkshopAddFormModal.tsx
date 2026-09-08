import React, { useState, useEffect } from 'react'
import {
  Form, Input, Select, Row, Col, Tag,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import styles from '../styles.less'

const { I18n } = window

interface Props {
  close(): void
}

interface WorkshopInviteResponse {
  id: string;
  campaignAssessmentGroupId: string;
}

export const WorkshopAddFormModal:React.FC<Props> = ({ close }) => {
  const { resource } = useResourceContext<Workshop>()
  const { inviteId, campaignId } = useParams() as { campaignId: string, inviteId: string }
  const [campaignAssessmentGroupId, setCampaignAssessmentGroupId] = useState<string>()

  const { fetchSingle } = useResources<WorkshopInvite>('workshop_invites', {
    basePath: `campaigns/${campaignId}`,
  })

  useEffect(() => {
    if (inviteId) {
      fetchSingle({
        id: inviteId,
        apiConfig: {
          fields: {
            workshop_invites: ['campaign_assessment_group_id'],
          },
        },
      }).then((response: WorkshopInviteResponse) => {
        if (response?.campaignAssessmentGroupId) {
          setCampaignAssessmentGroupId(response.campaignAssessmentGroupId)
        }
      })
    }
  }, [inviteId])

  const { addRelationships } = useResources<WorkshopInvite>('workshop_invites', {
    basePath: `/campaigns/${campaignId}/workshop_invites/${inviteId}`,
  })

  const [selectedWorkshops, setSelectedWorkshops] = useState<Workshop[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [error, setError] = useState(false)
  const {
    data: assessmentCenters, setData, getResource, fetch: fetchWorkshops,
  } = useResources<Workshop>('workshops', {
    basePath: `campaigns/${campaignId}`,
  })

  useEffect(() => {
    if (campaignAssessmentGroupId) {
      loadWorkshops()
    }
  }, [campaignAssessmentGroupId])

  const changeWorkshops = (value) => {
    setSearchValue('')
    setData([])
    if (_.find(selectedWorkshops, { id: value })) { return }
    const selectedWorkshop = getResource(value)
    if (selectedWorkshop) {
      setSelectedWorkshops(prev => [...prev, selectedWorkshop])
    }
  }

  const removeWorkshop = (id) => {
    setSelectedWorkshops(prev => prev.filter(w => w.id !== id))
  }

  const loadWorkshops = (search?: string) => {
    if (!campaignAssessmentGroupId) { return }

    const filter: Record<string, string> = {
      date_filter: 'upcoming',
      campaign_assessment_group_id_eq: campaignAssessmentGroupId,
    }

    if (search) {
      filter.search_query = search
    }

    fetchWorkshops({
      apiConfig: {
        filter,
      },
    })
  }

  const searchWorkshops = useDebouncedCallback((value: string) => {
    loadWorkshops(value)
  }, 200)

  const handleWorkshopSelectOpenChange = (open: boolean) => {
    if (open && assessmentCenters.length === 0 && !searchValue) {
      loadWorkshops()
    }
  }

  const create = () => {
    if (selectedWorkshops.length > 0) {
      setError(false)
      return addRelationships('workshops', selectedWorkshops.map(w => w.id)).then(() => {
        resource.setData([...resource.data, ...selectedWorkshops])
      })
    }
    setError(true)
    return Promise.reject(new Error(''))
  }

  return (
    <ResourceFormModal
      resourceName="workshop_invite_workshops"
      readableResourceName={I18n.t('admin.invite_workshop_title')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 720 }}
      request={{ createResource: create }}
    >
      {() => (
        <>
          <Form.Item hidden name="workshopInviteId" initialValue={inviteId}><Input /></Form.Item>
          <Form.Item
            name="workshopIds"
            label={I18n.t('admin.invite_workshop_title')}
            validateStatus={error ? 'error' : undefined}
            help={error && I18n.t('dry_errors.errors.filled?')}
            status={error ? 'error' : undefined}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className={styles.hint}>
                  {I18n.t('admin.invite_basic_info_assessment_centers_hint')}
                </div>
                <Select
                  showSearch={{
                    filterOption: false,
                    searchValue,
                    onSearch: (value) => {
                      setSearchValue(value)
                      searchWorkshops(value)
                    },
                  }}
                  placeholder={
                    I18n.t('admin.invite_basic_info_assessment_centers_placeholder')
                  }
                  options={assessmentCenters
                    .filter(workshop => !_.find(selectedWorkshops, { id: workshop.id }))
                    .map(workshop => ({
                      label: workshop.name, value: workshop.id,
                    }))}
                  onSelect={changeWorkshops}
                  onDropdownVisibleChange={handleWorkshopSelectOpenChange}
                  value={null}
                />
              </Col>
              <Col span={24}>
                {selectedWorkshops.map(workshop => (
                  <Tag key={workshop.id} closable onClose={() => removeWorkshop(workshop.id)}>
                    {workshop.name}
                  </Tag>
                ))}
              </Col>
            </Row>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
