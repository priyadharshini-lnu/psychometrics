import { useState } from 'react'
import { Form } from 'antd'
import { ScheduleDay } from '~/glint/components/ScheduleAvailability/ScheduleDay'

export const ScheduleDayTestWrapper = ({ label, day }) => {
  const [form] = Form.useForm()
  const [, setFields] = useState({})
  return (
    <Form
      form={form}
      onFieldsChange={(_, allFields) => {
        setFields(allFields)
      }}
    >
      <ScheduleDay
        label={label}
        formInstance={form}
        day={day}
      />
    </Form>
  )
}
