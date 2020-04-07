import React, { useState, useEffect } from 'react'
import { Menu, Input } from 'antd'
import Utils from 'utils/Utils'
import { DnDProvider, DnDElement } from 'components/DnD'
import styles from '../../../FormStyle.scss'
import { Question } from '../../../interfaces'
import { FormType } from '../../../interfaces/Question'
import Option from './Option'

interface Props {
  type: FormType
  model: Question
  index: number
}

interface OptionListState {
  id: string
  text: string
}
const { Item, Divider } = Menu

const OptionList: React.FC<Props> = ({
  type, type: { optionList = [] }, index, model,
}) => {
  const [text, setText] = useState<string>('')

  // eslint-disable-next-line arrow-body-style
  const addIdToOptionList = (optionList: string[]): OptionListState[] => {
    return optionList.map(option => ({ id: Utils.genId(), text: option }))
  }

  const [optionListState, setOptionListState] = useState<OptionListState[]>(addIdToOptionList(optionList))

  useEffect(() => {
    setOptionListState(addIdToOptionList(optionList))
  }, [optionList])


  const addOption = (e): void => {
    e.preventDefault()

    text && model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: [...optionList, text] },
    }, false)
    setText('')
  }

  const removeOption = (i: number): void => {
    const filteredOptionList = optionList.filter((_o, oi) => oi !== i)
    model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: filteredOptionList },
    }, false)
  }

  const updateOptionList = (): void => {
    model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: optionListState.map(o => o.text) },
    }, false)
  }

  return (
    <DnDProvider>
      <Menu className={styles.optionList}>
        {optionListState.map((option, i) => (
          <DnDElement
            key={option.id}
            wrapper={Item}
            onDrag={setOptionListState}
            rowList={optionListState}
            index={i}
            onEndDrag={updateOptionList}
          >
            <Option
              option={option.text}
              i={i}
              removeOption={removeOption}
            />
          </DnDElement>
        ))}
        <Divider />
        <div className={styles.menuInputContainer}>
          <Input value={text} onChange={({ target: { value } }): void => setText(value)} className={styles.menuInput} />
          <a className="ant-dropdown-link" onClick={addOption}>Add</a>
        </div>
      </Menu>
    </DnDProvider>
  )
}
export default OptionList
