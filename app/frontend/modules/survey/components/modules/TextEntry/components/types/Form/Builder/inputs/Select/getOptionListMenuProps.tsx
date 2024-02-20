import {
  useState, useEffect, useRef,
} from 'react'
import {
  MenuProps, Input, InputRef, Row,
} from 'antd'

import { ItemType } from 'antd/lib/menu/hooks/useItems'
import Utils from '~/modules/survey/utils/Utils'
import { useInputFocus } from '~/hooks/useInputFocus'
import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'

import { DnDElement } from '~/components/DnD'
import styles from '../../../FormStyle.less'
import Option from './Option'

interface OptionListMenuData {
  type: BuilderModel['props']['formTypes'][0]
  model: BuilderModel
  index: number
}

interface OptionListState {
  id: string
  text: string
}

export const getOptionListMenuProps = ({
  type, type: { optionList = [] }, index, model,
}: OptionListMenuData):MenuProps => {
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
  let menuItems: ItemType[] = options.map((option, i) => (
    {
      key: option.id,
      label: (
        <DnDElement
          key={option.id}
          uniqField="id"
          strategy="index"
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
      ),
    }
  ))
  menuItems = [
    ...menuItems,
    { type: 'divider' },
    {
      key: 'input',
      label: (
        <Row wrap={false}>
          <Input
            ref={inputRef}
            value={text}
            onChange={({ target: { value } }): void => setText(value)}
            className={styles.menuInput}
            onPressEnter={addOptionEventHandler}
            onPaste={onPasteEventHandler}
          />
          <a className="ant-dropdown-link" onClick={addOptionEventHandler}>Add</a>
        </Row>),
    },
  ]

  return ({ items: menuItems, className: styles.optionList })
}
