import {
  useState, useRef, useMemo, useEffect,
} from 'react'
import {
  Button, Dropdown, Flex, Checkbox, InputNumber, Popover, Space, Typography, GetRef, MenuProps,
} from 'antd'
import { DownOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ToolbarAction } from './types'
import styles from './styles.less'

const { I18n } = window

type InputNumberRef = GetRef<typeof InputNumber>

const TEXT_COLOR = 'var(--grey-text)'

const TONE_OPTIONS = [
  { key: 'formal', label: I18n.t('admin.formal') },
  { key: 'casual', label: I18n.t('admin.casual') },
  { key: 'professional', label: I18n.t('admin.professional') },
]

export interface ActionValue {
  conciseCount?: number | null
  translateLanguage?: string
  tone?: string
}

interface ActionRendererProps {
  action: ToolbarAction
  checked: boolean
  onToggle: (checked: boolean) => void
  onValueChange: (value: ActionValue) => void
  getPopupContainer: () => HTMLElement
  resetTrigger: number
}

export function ActionRenderer ({
  action,
  checked,
  onToggle,
  onValueChange,
  getPopupContainer,
  resetTrigger,
}: ActionRendererProps) {
  const [conciseCount, setConciseCount] = useState<number | null>(null)
  const [showConciseEditor, setShowConciseEditor] = useState(false)
  const [translateLanguage, setTranslateLanguage] = useState('')
  const [openLangDropdown, setOpenLangDropdown] = useState(false)
  const [tone, setTone] = useState('')

  const conciseInputRef = useRef<InputNumberRef>(null)

  useEffect(() => {
    setConciseCount(null)
    setShowConciseEditor(false)
    setTranslateLanguage('')
    setOpenLangDropdown(false)
    setTone('')
  }, [resetTrigger])

  useEffect(() => {
    if (showConciseEditor) {
      setTimeout(() => conciseInputRef.current?.focus?.(), 0)
    }
  }, [showConciseEditor])

  const languageItems = useMemo(() => (
    (I18n?.availableLocales || []).map((locale: string) => ({
      key: locale,
      label: I18n.t(`languages.${locale}`),
      onClick: () => {
        setTranslateLanguage(locale)
        setOpenLangDropdown(false)
        onToggle(true)
        onValueChange({ translateLanguage: locale })
      },
    }))
  ), [onToggle, onValueChange])

  const handleToneClick: MenuProps['onClick'] = ({ key }) => {
    setTone(key)
    onToggle(true)
    onValueChange({ tone: key })
  }

  const handleConciseCountChange = (value: number | null) => {
    setConciseCount(value)
    onValueChange({ conciseCount: value })
  }

  if (action.key === 'concise') {
    return (
      <Flex align="center" gap={8}>
        <Checkbox
          checked={checked}
          onChange={e => onToggle(e.target.checked)}
        />
        <Flex align="center" gap={4} style={{ flex: 1 }}>
          {action.icon}
          <Typography.Text>{action.label}</Typography.Text>
          <Popover
            style={{ zIndex: 10000 }}
            open={showConciseEditor}
            onOpenChange={setShowConciseEditor}
            trigger="click"
            getPopupContainer={getPopupContainer}
            content={(
              <Flex vertical gap="small">
                <div style={{ fontWeight: 500 }}>{I18n.t('admin.add_word_count')}</div>
                <InputNumber
                  ref={conciseInputRef}
                  value={conciseCount}
                  onChange={v => handleConciseCountChange(v as number | null)}
                  style={{ width: '100%' }}
                  onPressEnter={() => setShowConciseEditor(false)}
                />
                <Button
                  type="primary"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowConciseEditor(false)
                  }}
                >
                  {I18n.t('shared.add')}
                </Button>
              </Flex>
            )}
          >
            <Space style={{ cursor: 'pointer', marginLeft: 'auto' }}>
              {conciseCount !== null ? (
                <Typography.Text style={{ color: TEXT_COLOR }}>
                  {conciseCount}
                  {' '}
                  {I18n.t('admin.words')}
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined style={{ color: TEXT_COLOR }} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setConciseCount(null)
                      onValueChange({ conciseCount: null })
                    }}
                  />
                </Typography.Text>
              ) : (
                <Typography.Text style={{ color: TEXT_COLOR }}>
                  {I18n.t('shared.add')}
                  {' '}
                  {I18n.t('admin.words')}
                </Typography.Text>
              )}
              <DownOutlined style={{ color: TEXT_COLOR }} />
            </Space>
          </Popover>
        </Flex>
      </Flex>
    )
  }

  if (action.key === 'translate') {
    return (
      <Flex align="center" gap={8}>
        <Flex align="center" gap={4} style={{ flex: 1 }}>
          {action.icon}
          <Dropdown
            menu={{ items: languageItems }}
            open={openLangDropdown}
            classNames={{ root: styles.languageDropdown }}
            onOpenChange={setOpenLangDropdown}
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Typography.Text>{action.label}</Typography.Text>
              {translateLanguage !== '' && (
                <Typography.Text style={{ marginLeft: 'auto', color: TEXT_COLOR }}>
                  {I18n.t(`languages.${translateLanguage}`)}
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined style={{ color: TEXT_COLOR }} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setTranslateLanguage('')
                      onValueChange({ translateLanguage: '' })
                    }}
                  />
                </Typography.Text>
              )}
              <DownOutlined style={{ color: TEXT_COLOR }} />
            </Space>
          </Dropdown>
        </Flex>
      </Flex>
    )
  }

  if (action.key === 'tone') {
    return (
      <Flex align="center" gap={8}>
        <Flex align="center" gap={4} style={{ flex: 1 }}>
          {action.icon}
          <Dropdown
            menu={{ items: TONE_OPTIONS, onClick: handleToneClick }}
            trigger={['click']}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Typography.Text>{action.label}</Typography.Text>
              {tone !== '' && (
                <Typography.Text style={{ marginLeft: 'auto', color: TEXT_COLOR }}>
                  {I18n.t(`admin.${tone}`)}
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined style={{ color: TEXT_COLOR }} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      setTone('')
                      onValueChange({ tone: '' })
                    }}
                  />
                </Typography.Text>
              )}
              <DownOutlined style={{ color: TEXT_COLOR }} />
            </Space>
          </Dropdown>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex align="center" gap={8}>
      <Checkbox
        checked={checked}
        onChange={e => onToggle(e.target.checked)}
      />
      <Flex align="center" gap={8} style={{ flex: 1 }}>
        {action.icon}
        <Typography.Text>{action.label}</Typography.Text>
      </Flex>
    </Flex>
  )
}
