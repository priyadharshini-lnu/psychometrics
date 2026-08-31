import {
  useState, useEffect, useRef,
} from 'react'
import {
  MenuProps, Input, InputRef, Row, Col, Form, Button,
} from 'antd'

import { useMatch, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { MenuItem } from '~/interfaces/Antd'
import Utils from '~/modules/survey/utils/Utils'
import { useInputFocus } from '~/hooks/useInputFocus'
import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import { RootState } from '~/modules/survey/core/rootReducers'

import { DnDElement } from '~/components/DnD'
import styles from '../../../FormStyle.less'
import Option from './Option'

interface OptionListMenuData {
  type: BuilderModel['props']['formTypes'][0]
  model: BuilderModel
  index: number
}

type OptionListState = {
  id: string
} & (
  | { text: string; label?: never; value?: never }
  | { label: string; value: string; text?: never }
)

const { I18n } = window

export const getOptionListMenuProps = ({
  type, type: { optionList = [] }, index, model,
}: OptionListMenuData):MenuProps => {
  const [form] = Form.useForm()
  const [label, setLabel] = useState<string>('')
  const inputRef = useRef<InputRef>(null)
  const labelInputRef = useRef<InputRef>(null)
  const setFocus = useInputFocus(inputRef)
  const [params] = useSearchParams()
  const { defaultLanguage } = useSelector((state:RootState) => state.survey.builder?.assessment || {})
  const currentLocale = params.get('assessmentLang') || 'en'
  const isAssessmentDefaultLocale = defaultLanguage === currentLocale
  const adminBlockRoute = useMatch('/admin/templates/blocks/:id/edit')
  const legacyBlockRoute = useMatch('/administration/templates/blocks/:id/edit')
  // A block has no assessment and no language picker, so the default-locale gate does not apply there.
  const allowOptionEditing = Boolean(adminBlockRoute || legacyBlockRoute) || isAssessmentDefaultLocale

  const generateValueFromLabel = (labelText: string): string => labelText
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  useEffect(() => {
    if (label) {
      const generatedValue = generateValueFromLabel(label)
      form.setFieldsValue({ value: generatedValue })
    } else {
      form.setFieldsValue({ value: '' })
    }
  }, [label, form])

  const getOptionDisplay = (option: OptionListState): string => {
    if ('label' in option && option.label !== undefined) {
      return option.label
    }
    return option.text || ''
  }

  const addIdToOptionList = (
    optionList: string[] | { [key: string]: string },
  ): OptionListState[] => {
    if (Array.isArray(optionList)) {
      return optionList.map(text => ({
        id: Utils.genId(),
        text,
      }))
    }
    return Object.entries(optionList).map(([key, value]) => ({
      id: Utils.genId(),
      label: value,
      value: key,
    }))
  }


  const getLines = (text: string) => text.split(/(\n|\u2028)/).map(t => t.trim()).filter(t => t.length)

  const [options, setOptions] = useState<OptionListState[]>(addIdToOptionList(optionList))

  useEffect(() => {
    setOptions(addIdToOptionList(optionList))
  }, [optionList])

  const onFormFinish = (values: { label: string; value?: string }): void => {
    if (values.label?.trim()) {
      addOptions({
        label: values.label.trim(),
        value:
          values.value ? values.value.trim() : generateValueFromLabel(values.label.trim()),
      })
      setLabel('')
      form.resetFields()
      setFocus(true)
    }
  }

  const onPasteEventHandler = (e): void => {
    const clipboardText = e.clipboardData.getData('text')
    const lines = getLines(clipboardText)
    if (lines.length <= 1) return

    lines.forEach(line => addOptions(line))
    setLabel('')
    form.resetFields()
    setFocus(true)
  }

  const addOptions = (optionData: { label: string; value: string } | string) => {
    let newOption: { label: string; value: string }

    if (typeof optionData === 'string') {
      const displayLabel = optionData.trim()
      newOption = { label: displayLabel, value: generateValueFromLabel(displayLabel) }
    } else {
      newOption = { label: optionData.label, value: optionData.value }
    }

    if (newOption.label && newOption.value) {
      const updatedOptionList = { ...optionList, [newOption.value]: newOption.label }

      model.changeArrayProps({
        collection: 'formTypes',
        i: index,
        val: { ...type, optionList: updatedOptionList },
      }, false)
    }
  }

  const removeOption = (i: number): void => {
    const entries = Object.entries(optionList || {})
    const filteredEntries = entries.filter((_entry, oi) => oi !== i)
    const filteredOptionList = Object.fromEntries(filteredEntries)

    model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: filteredOptionList },
    }, false)
  }

  const handleEditOption = (i: number, newData: { label?: string; value?: string; text?: string }): void => {
    const updatedOptions = options.map((option, index) => {
      if (index !== i) return option

      const baseOption = { id: option.id }

      if (newData.label !== undefined && newData.value !== undefined) {
        return { ...baseOption, label: newData.label, value: newData.value }
      }

      if (newData.text !== undefined) {
        return { ...baseOption, text: newData.text }
      }
      return option
    })

    const resultObj: { [key: string]: string } = {}
    updatedOptions.forEach((o) => {
      if ('label' in o && 'value' in o && o.label && o.value) {
        resultObj[o.value] = o.label
      } else if ('text' in o && o.text) {
        const generatedKey = generateValueFromLabel(o.text)
        resultObj[generatedKey] = o.text
      }
    })
    const updatedOptionList = resultObj

    model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: updatedOptionList },
    }, false)
  }

  const updateOptionList = (): void => {
    const resultObj: { [key: string]: string } = {}
    options.forEach((o) => {
      if ('label' in o && 'value' in o && o.label && o.value) {
        resultObj[o.value] = o.label
      } else if ('text' in o && o.text) {
        const generatedKey = generateValueFromLabel(o.text)
        resultObj[generatedKey] = o.text
      }
    })
    const updatedOptionList = resultObj

    model.changeArrayProps({
      collection: 'formTypes',
      i: index,
      val: { ...type, optionList: updatedOptionList },
    }, false)
  }
  let menuItems: MenuItem[] = options.map((option, i) => (
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
            option={getOptionDisplay(option)}
            optionData={option}
            i={i}
            removeOption={removeOption}
            onEditOption={handleEditOption}
            allowRemoveOption={allowOptionEditing}
          />
        </DnDElement>
      ),
    }
  ))

  const addNewOptionMenuItems: MenuItem[] = [
    { type: 'divider' },
    {
      key: 'input',
      label: (
        <Form
          form={form}
          onFinish={onFormFinish}
          layout="horizontal"
          size="small"
        >
          <Row wrap={false} gutter={8} align="middle">
            <Col flex="1">
              <Form.Item
                name="label"
                rules={[{ required: true, message: I18n.t('administration.assessment_builder.form.label_required') }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  ref={labelInputRef}
                  placeholder={I18n.t('administration.assessment_builder.form.display_label')}
                  onChange={({ target: { value } }): void => {
                    setLabel(value)
                  }}
                  className={styles.menuInput}
                  onPressEnter={(e) => {
                    e.preventDefault()
                    form.submit()
                  }}
                  onPaste={onPasteEventHandler}
                />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item
                name="value"
                rules={[{ required: true, message: I18n.t('administration.assessment_builder.form.value_required') }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder={I18n.t('administration.assessment_builder.form.value')}
                  className={styles.menuInput}
                  onPressEnter={(e) => {
                    e.preventDefault()
                    form.submit()
                  }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Button
                type="link"
                onClick={() => form.submit()}
                className="ant-dropdown-link"
                style={{ padding: 0, height: 'auto' }}
              >
                {I18n.t('common.actions.add')}
              </Button>
            </Col>
          </Row>
        </Form>
      ),
    }]

  menuItems = allowOptionEditing ? [...menuItems, ...addNewOptionMenuItems] : menuItems

  return ({ items: menuItems, className: styles.optionList })
}
