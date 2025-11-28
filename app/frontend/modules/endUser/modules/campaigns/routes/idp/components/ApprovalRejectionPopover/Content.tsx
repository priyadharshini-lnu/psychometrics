

import { useState, useEffect } from 'react'
import {
  Input, Flex,
} from 'antd'
import { ButtonWithArrow } from '~/glint'

const { I18n } = window


type ContentProps = {
  setOpen: (open: boolean) => void;
  isLoading: boolean;
  clickHandler: (note: string) => void;
  placeholder: string;
  allowDisabling?: boolean;
}
export const Content = ({
  setOpen, clickHandler, isLoading, placeholder, allowDisabling,
}:ContentProps) => {
  const [reason, setReason] = useState('')

  useEffect(() => {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', e => closeOnEscape(e))

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <Flex vertical gap={8}>
      <Input.TextArea
        value={reason}
        style={{
          width: 300,
        }}
        autoSize={{ minRows: 3, maxRows: 5 }}
        onChange={e => setReason(e.target.value)}
        placeholder={placeholder}
      />
      <ButtonWithArrow
        style={{
          width: '80px',
        }}
        className="self-end"
        type="primary"
        size="small"
        onClick={() => { clickHandler(reason) }}
        loading={isLoading}
        disabled={allowDisabling ? reason.trim().length === 0 : false}
        label={I18n.t('common.actions.submit')}
      />
    </Flex>
  )
}
