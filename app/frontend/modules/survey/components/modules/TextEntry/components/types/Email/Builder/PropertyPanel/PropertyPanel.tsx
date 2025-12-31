import React from 'react'
import { Input, Button, Divider } from 'antd'
import { DeleteOutlined, PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ChoicesInput from '~/modules/survey/components/ChoicesInput'

import { PropertiesModel } from '~/modules/survey/interfaces/questions/TextEntry'

import styles from './PropertyPanelStyle.less'

interface Props {
  model: PropertiesModel
}

const PropertyPanel: React.FC<Props> = ({
  model,
  model: {
    props: {
      contactList,
      maxLength,
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

  const changeMaxLength = (maxLength: number) => {
    model.changeProps({ maxLength })
  }

  return (
    <div className={styles.container}>
      Max Length
      <ChoicesInput minValue={0} maxValue={10000} value={maxLength || 0} onChange={changeMaxLength} />
      <div className={styles.label}>Contacts</div>
      {contactList.map((contact: string, i: number) => (
        <div key={i} className={styles.inputContainer}>
          <Input
            size="small"
            className={styles.input}
            defaultValue={contact}
            onBlur={({ target: { value } }): void => changeContact(value, i)}
          />
          <DeleteOutlined onClick={(): void => deleteContact(i)} />
        </div>
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={addContact} className={styles.button}>
        Add
      </Button>
      <Divider />
    </div>
  )
}

export default PropertyPanel
