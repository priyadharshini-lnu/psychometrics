import {
  Button, Col, Row, Space, App, Layout,
} from 'antd'
import { BaseMeta } from 'hooks/useResources/interfaces'
import { useEffect, useState } from 'react'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { useResources } from '~/hooks/useResources'
import {
  UserAvailabilityDate, UserAvailabilityDateTR,
} from '~/modules/admin/modules/UserAvailability/core/userAvailabilityDates'
import { ScheduleAvailability } from '~/glint'
import { ErrorMessage } from '~/glint/components/ScheduleAvailability/interfaces'
import { CountDisplay } from '~/components/CountDisplay'

const { I18n } = window

type ErrorMessageList = Record<string, ErrorMessage | undefined>

const AvailabilityListing = () => {
  const {
    data: userAvailabilityDates, fetch, meta, isLoading, isRequestSuccessful, removeResource,
    createResource, updateResource,
  } = useResources<UserAvailabilityDate, BaseMeta>(
    'user_availability_dates',
    {
      trackUrl: true,
      responseType: UserAvailabilityDateTR,
      apiConfig: {
        include: ['user_availability_days'],
        filter: { end_date_gteq: dayjs().format('YYYY-MM-DD') },
      },
    },
  )
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false)
  const [errors, setErrors] = useState({} as ErrorMessageList)
  const { modal, message } = App.useApp()
  const fetchSuccessful = isRequestSuccessful('fetch')

  useEffect(() => {
    fetch()
  }, [])

  useEffect(() => {
    if (userAvailabilityDates.length === 0 && fetchSuccessful) {
      setShowNewScheduleForm(true)
    }
  }, [userAvailabilityDates.length, fetchSuccessful])

  const handleOnRemove = (id: string) => {
    modal.confirm({
      title: I18n.t('frontend.availability.remove_confirm.title'),
      content: I18n.t('frontend.availability.remove_confirm.content'),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        removeResource(id).then(() => {
          message.info(I18n.t('frontend.availability.remove_confirm.success'))
        })
      },
    })
  }

  const handleCreate = (data) => {
    setErrors({ ...errors, new_form: undefined })
    return createResource(data)
      .then(() => {
        setShowNewScheduleForm(false)
        setErrors({ ...errors, new_form: undefined })
        message.success(I18n.t('frontend.availability.create_success'))
      })
      .catch((e) => {
        setErrors({ ...errors, newForm: e })
      })
  }

  const handleUpdate = (data) => {
    setErrors({ ...errors, [data.id]: null })
    return updateResource(data)
      .then(() => {
        setErrors({ ...errors, [data.id]: null })
        message.success(I18n.t('frontend.availability.update_success'))
      })
      .catch((e) => {
        setErrors({ ...errors, [data.id]: e })
      })
  }

  return (
    <Layout.Content>
      <Row
        justify="space-between"
        align="middle"
        className="pt-4 pb-4 ps-4 pe-4"
      >
        <Col>
          <CountDisplay
            totalCount={meta.recordCount}
            isLoading={isLoading('fetch')}
          />
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              disabled={showNewScheduleForm}
              onClick={() => setShowNewScheduleForm(true)}
            >
              <PlusOutlined />
              {I18n.t('frontend.availability.add_new_availability')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row className="p-10">
        <Col lg={24} xxl={18}>
          {showNewScheduleForm && (
            <ScheduleAvailability
              id="new"
              onFormSubmit={data => handleCreate(data)}
              className="mb-10"
              collapsed={false}
              removable={userAvailabilityDates.length > 0}
              onRemove={() => setShowNewScheduleForm(false)}
              errorMessages={errors?.newForm}
            />
          )}
          {userAvailabilityDates.map((userAvailabilityDate, index) => (
            <ScheduleAvailability
              id={userAvailabilityDate.id}
              key={userAvailabilityDate.id}
              onFormSubmit={data => handleUpdate({ ...data, id: userAvailabilityDate.id })}
              initialAvailability={
              { ...userAvailabilityDate, availabilityDays: userAvailabilityDate.userAvailabilityDays }
            }
              onRemove={id => handleOnRemove(id)}
              collapsed={false}
              className={`${index !== 0 ? 'mt-10' : ''}`}
              errorMessages={errors[userAvailabilityDate.id]}
            />
          ))}
        </Col>
      </Row>
    </Layout.Content>
  )
}

export default AvailabilityListing
