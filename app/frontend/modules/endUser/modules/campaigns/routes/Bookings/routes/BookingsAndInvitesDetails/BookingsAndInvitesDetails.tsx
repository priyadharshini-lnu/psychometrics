import { useState } from 'react'
import {
  Col, Layout, Form,
} from 'antd'
import moment, { Moment } from 'moment-timezone'
import cs from 'classnames'

import { Questionnaire } from './Questionnaire'
import { BookingCard, ButtonWithArrow } from '~/glint'

import styles from './BookingsAndInvitesDetails.less'

// hard coded for testing, this data will come from backend
const bookingDetails = {
  id: 1,
  title: 'Title of the invite will come here',
  availableDates: [
    { id: 1, date: '2023-07-15T20:00:00.100+05:30' },
    { id: 7, date: '2023-07-15T09:30:00.100+05:30' },
    { id: 2, date: '2023-07-16T10:00:00.100+05:30' },
    { id: 8, date: '2023-07-16T10:30:00.100+05:30' },
    { id: 3, date: '2023-07-17T11:00:00.100+05:30' },
    { id: 4, date: '2023-07-08T08:00:00.100+05:30' },
    { id: 5, date: '2023-07-09T09:00:00.100+05:30' },
    { id: 6, date: '2023-07-10T14:00:00.100+05:30' },
  ],
  description: 'You have been invited to the Specialist Assessment center. Please book you available slot.',
  neuroDivergent: true,
  languagePreference: true,
  languages: ['English', 'Arabic'],
}

const availableDates = bookingDetails.availableDates.map(dateObj => moment(dateObj.date))
export const BookingsAndInvitesDetails = () => {
  const [selectedDateTime, setSelectedDateTime] = useState<Moment | null>(null)
  const [questionForm] = Form.useForm()

  const handleBook = () => {
    // actions to to performed upon book
  }

  return (
    <Layout.Content className={styles.pageContent}>
      <Col
        className={cs('mb-6', 'mt-6', styles.column, { [styles.narrowColumn]: !selectedDateTime })}
        xs={24}
        sm={24}
        md={24}
        lg={24}
        xl={22}
        xxl={18}
      >
        <BookingCard
          currentDateTime={selectedDateTime}
          title={bookingDetails.title}
          description={bookingDetails.description}
          availableDateTimes={availableDates}
          onDateTimeSelection={setSelectedDateTime}
          questionnaireComponent={(
            <Questionnaire
              formInstance={questionForm}
              neuroDivergent={bookingDetails.neuroDivergent}
              languagePreference={bookingDetails.languagePreference}
              languages={bookingDetails.languages}
            />
          )}
        />
        {selectedDateTime
        && (
        <div className="flex mt-6 justify-end">
          <ButtonWithArrow label="Book" type="primary" onClick={handleBook} />
        </div>
        )}
      </Col>
    </Layout.Content>
  )
}
