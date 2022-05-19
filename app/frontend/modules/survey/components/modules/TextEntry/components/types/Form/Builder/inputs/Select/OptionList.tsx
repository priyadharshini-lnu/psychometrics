import React, {
  useState, useEffect, useRef,
} from 'react'
import { Menu, Input, InputRef } from 'antd'

import Utils from 'modules/survey/utils/Utils'
import { DnDElement } from 'components/DnD'
import { useInputFocus } from 'hooks/useInputFocus'
import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'

import styles from '../../../FormStyle.scss'
import Option from './Option'

interface Props {
  type: BuilderModel['props']['formTypes'][0]
  model: BuilderModel
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
  const inputRef = useRef<InputRef>(null)
  const setFocus = useInputFocus(inputRef)

  // eslint-disable-next-line arrow-body-style
  const addIdToOptionList = (optionList: string[]): OptionListState[] => {
    return optionList.map(option => ({ id: Utils.genId(), text: option }))
  }

  const getLines = (text: string) => text.split(/(\n|\u2028)/).map(t => t.trim()).filter(t => t.length)

  const [options, setOptions] = useState<OptionListState[]>(addIdToOptionList(optionList))

  useEffect(() => {
    setOptions(addIdToOptionList(optionList))
  }, [optionList])

  const addOptionEventHandler = (e): void => {
    e.preventDefault()
    addOptions(text)
    setText('')
    setFocus(true)
  }

  const onPasteEventHandler = (e): void => {
    const clipboardText = e.clipboardData.getData('text')
    const lines = getLines(clipboardText)
    if (lines.length <= 1) return
    addOptions(clipboardText)
    setText('')
    setFocus(true)
  }

  const addOptions = (text: string) => {
    const lines = getLines(text)
    if (lines.length > 0) {
      model.changeArrayProps({
        collection: 'formTypes',
        i: index,
        val: { ...type, optionList: [...optionList, ...lines] },
      }, false)
    }
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
      val: { ...type, optionList: options.map(o => o.text) },
    }, false)
  }

  return (
    <Menu className={styles.optionList}>
      {options.map((option, i) => (
        <DnDElement
          key={option.id}
          uniqField="id"
          strategy="index"
          wrapper={Item}
          onDrag={setOptions}
          list={options}
          element={option}
          additionalWrapper
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
        <Input
          ref={inputRef}
          value={text}
          onChange={({ target: { value } }): void => setText(value)}
          className={styles.menuInput}
          onPressEnter={addOptionEventHandler}
          onPaste={onPasteEventHandler}
        />
        <a className="ant-dropdown-link" onClick={addOptionEventHandler}>Add</a>
      </div>
    </Menu>
  )
}
export default OptionList
