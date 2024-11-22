import React from 'react'
import { Tag } from 'antd'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import styles from './styles.less'
import { Question } from '../../interfaces'

interface Props {
  model: Question
}

interface ContactsProps {
  contacts: string[]
}

const Contacts: React.FC<ContactsProps> = ({ contacts }) => (
  <>
    {contacts.map(contact => <Tag>{contact}</Tag>)}
  </>
)

const ReadOnly: React.FC<Props> = ({ model }) => {
  const {
    answers: {
      message, cc, bcc, to, subject,
    },
  } = model.result
  const translatedContacts = (contacts: string[]) => contacts.map((contact) => {
    const index = model.props.contactList.indexOf(contact)
    return index >= 0 ? I18n().tQuestion(model, `contact${index}`, { index }) : contact
  })
  return (
    <div className={styles.container}>
      <table className={styles.contacts} role="presentation">
        <tbody>
          <tr>
            <td className={styles.contactLabel}>{I18n().t('threesixty.question.email_type.to')}</td>
            <td>{to && <Contacts contacts={translatedContacts(to)} />}</td>
          </tr>
          {cc && cc.length ? (
            <tr className="mt-2">
              <td className={styles.contactLabel}>{I18n().t('threesixty.question.email_type.cc')}</td>
              <td><Contacts contacts={translatedContacts(cc)} /></td>
            </tr>
          ) : null}
          {bcc && bcc.length ? (
            <tr className="mt-2">
              <td className={styles.contactLabel}>{I18n().t('threesixty.question.email_type.bcc')}</td>
              <td><Contacts contacts={translatedContacts(bcc)} /></td>
            </tr>
          ) : null}
          {subject && subject.length ? (
            <tr>
              <td className={styles.contactLabel}>{I18n().t('threesixty.question.email_type.subject')}</td>
              <td>{subject}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <hr />
      <div className={styles.body}>
        {message}
      </div>

    </div>
  )
}

export default ReadOnly
