import { useEffect } from 'react'
import {
  Form, Switch, DatePicker, Button,
} from 'antd'
import dayjs from '~/utils/dayjs'
import ResourceForm from '~/components/ResourceForm'
import TimeZoneSelect from '~/components/TimeZoneSelect'
import { useResources } from '~/hooks/useResources'
import styles from './styles.less'

const { I18n } = window

interface MaintenanceSetting {
  id: string
  subSystem: string
  maintenanceWindowEnabled: boolean
  timeZone: string
  startTime: string
  endTime: string
}

interface MaintenanceFormProps {
  subsystemKey: string
  maintenanceSetting?: MaintenanceSetting
  onSuccess: () => void
  onCancel: () => void
}

const DATE_FORMAT = 'DD/MM/YYYY'
const TIME_FORMAT = 'h:mm A'

const parseTimeWithTimezone = (time: string | null, timezone: string) => (
  time ? dayjs(time).tz(timezone) : null
)

const formatTimeForApi = (time: dayjs.Dayjs | null, timezone: string) => {
  if (!time) return null
  const dateStr = time.format('YYYY-MM-DD')
  const hour = time.hour()
  const minute = time.minute()
  return dayjs.tz(`${dateStr} ${hour}:${minute}`, 'YYYY-MM-DD H:m', timezone).format()
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  subsystemKey,
  maintenanceSetting,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm()
  const { createResource, updateResource, isLoading } = useResources<MaintenanceSetting>(
    'maintenance_settings',
    { trackUrl: false },
  )

  useEffect(() => {
    if (maintenanceSetting) {
      form.setFieldsValue({
        maintenanceWindowEnabled: maintenanceSetting.maintenanceWindowEnabled,
        timeZone: maintenanceSetting.timeZone,
        startTime: parseTimeWithTimezone(maintenanceSetting.startTime, maintenanceSetting.timeZone),
        endTime: parseTimeWithTimezone(maintenanceSetting.endTime, maintenanceSetting.timeZone),
      })
    }
  }, [maintenanceSetting, form])

  const formattedResource = maintenanceSetting ? {
    id: maintenanceSetting.id,
    maintenanceWindowEnabled: maintenanceSetting.maintenanceWindowEnabled,
    timeZone: maintenanceSetting.timeZone,
    startTime: parseTimeWithTimezone(
      maintenanceSetting.startTime,
      maintenanceSetting.timeZone,
    ),
    endTime: parseTimeWithTimezone(
      maintenanceSetting.endTime,
      maintenanceSetting.timeZone,
    ),
  } : undefined

  const transformValues = values => ({
    ...values,
    subSystem: subsystemKey,
    maintenanceWindowEnabled: values.maintenanceWindowEnabled || false,
    startTime: formatTimeForApi(values.startTime, values.timeZone),
    endTime: formatTimeForApi(values.endTime, values.timeZone),
  })

  const handleSuccess = () => {
    form.resetFields()
    onSuccess()
  }

  return (
    <div className="pb-8">
      <div className={styles.scrollableContent}>
        <ResourceForm
          resourceName="maintenance_settings"
          readableResourceName={I18n.t('admin.maintenance_settings')}
          resource={formattedResource}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            preserve: false,
            layout: 'vertical',
          }}
          request={{
            createResource,
            updateResource,
          }}
          transformValues={transformValues}
          onSuccessfulSubmission={handleSuccess}
        >
          {() => (
            <>
              <Form.Item style={{ marginBottom: '1rem' }}>
                <div className="flex items-center">
                  <Form.Item
                    name="maintenanceWindowEnabled"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch />
                  </Form.Item>
                  <label className="ms-4">
                    {I18n.t('admin.enable_maintenance')}
                  </label>
                </div>
              </Form.Item>
              <Form.Item
                name="timeZone"
                label={I18n.t('admin.timezone')}
                rules={[{ required: true, message: I18n.t('validations.blank') }]}
              >
                <TimeZoneSelect />
              </Form.Item>
              <Form.Item
                name="startTime"
                label={I18n.t('admin.start_time')}
                rules={[{ required: true, message: I18n.t('validations.blank') }]}
              >
                <DatePicker
                  showTime={{
                    format: TIME_FORMAT,
                    use12Hours: true,
                    minuteStep: 15,
                    showNow: false,
                  }}
                  format={`${DATE_FORMAT} ${TIME_FORMAT}`}
                  style={{ width: '100%' }}
                  placeholder={I18n.t('admin.select_start_time')}
                  disabledDate={date => date.isBefore(dayjs(), 'day')}
                />
              </Form.Item>
              <Form.Item
                name="endTime"
                label={I18n.t('admin.end_time')}
                rules={[
                  { required: true, message: I18n.t('validations.blank') },
                  ({ getFieldValue }) => ({
                    validator (_, value) {
                      const startTime = getFieldValue('startTime')
                      if (!value || !startTime) return Promise.resolve()
                      if (value.isSameOrBefore(startTime)) {
                        return Promise.reject(new Error(I18n.t('admin.end_time_must_be_after_start_time')))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime={{
                    format: TIME_FORMAT,
                    use12Hours: true,
                    minuteStep: 15,
                    showNow: false,
                  }}
                  format={`${DATE_FORMAT} ${TIME_FORMAT}`}
                  style={{ width: '100%' }}
                  placeholder={I18n.t('admin.select_end_time')}
                  disabledDate={(date) => {
                    const startTime = form.getFieldValue('startTime')
                    if (!startTime) return false
                    return date.isBefore(startTime, 'day')
                  }}
                />
              </Form.Item>
            </>
          )}
        </ResourceForm>
      </div>
      <div
        className={styles.footer}
      >
        <Button onClick={onCancel}>
          {I18n.t('shared.cancel')}
        </Button>
        <Button
          type="primary"
          className="ms-2"
          onClick={() => form.submit()}
          loading={
            maintenanceSetting
              ? isLoading(`update@${maintenanceSetting.id}`)
              : false
          }
        >
          {I18n.t('shared.save')}
        </Button>
      </div>
    </div>
  )
}

export default MaintenanceForm
