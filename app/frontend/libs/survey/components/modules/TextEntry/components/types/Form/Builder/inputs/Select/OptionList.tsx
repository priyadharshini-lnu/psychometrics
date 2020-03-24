import React, { useState, useEffect } from 'react'
import { Menu, Input } from 'antd'
import { DnDProvider, DnDElement } from '../../../../../../../../../components/DnD'
import styles from '../../../FormStyle.scss'
import { Question } from '../../../interfaces'
import { FormType } from '../../../interfaces/Question'
import Option from './Option'

interface Props {
  type: FormType
  model: Question
  index: number
}

const { Item, Divider } = Menu

const OptionList: React.FC<Props> = ({
  type, type: { optionList = [] }, index, model,
}) => {
  const [text, setText] = useState<string>('')
  const [optionListState, setOptionListState] = useState<string[]>(optionList)

  useEffect(() => {
    setOptionListState(optionList)
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
      val: { ...type, optionList: optionListState },
    }, false)
  }

  return (
    <DnDProvider>
      <Menu className={styles.optionList}>
        {optionListState.map((option, i) => (
          <Item key={i}>
            <DnDElement onDrag={setOptionListState} rowList={optionListState} index={i} onEndDrag={updateOptionList}>
              <Option
                option={option}
                i={i}
                removeOption={removeOption}
              />
            </DnDElement>
          </Item>
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
