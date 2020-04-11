import React from 'react'
import { Input, Button } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Question } from '../../interfaces'
import styles from './PropertyPanelStyle.scss'

interface Props {
  model: Question
}

const PropertyPanel: React.FC<Props> = ({
  model,
  model: {
    props: {
      contactList,
    },
  },
}) => {
  const addContact = (): void => model.changeProps({ contactList: [...contactList, ''] })

  const deleteContact = (index: number): void => {
    model.changeProps({ contactList: contactList.filter((_e, i) => i !== index) })
  }

  const changeContact = (val: string, i: number): void => {
    model.changeArrayProps({ collection: 'contactList', i, val }, false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>Contacts</div>
      {contactList.map((contact: string, i: number) => (
        <div key={i} className={styles.inputContainer}>
          <Input
            size="small"
            className={styles.input}
            value={contact}
            onChange={({ target: { value } }): void => changeContact(value, i)}
          />
          <DeleteOutlined onClick={(): void => deleteContact(i)} />
        </div>
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={addContact} className={styles.button}>
        Add
      </Button>
      <hr className={styles.divider} />
    </div>
  )
}

export default PropertyPanel
