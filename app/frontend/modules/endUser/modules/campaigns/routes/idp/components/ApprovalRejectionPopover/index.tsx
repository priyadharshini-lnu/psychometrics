import {
  Popover, Typography, Flex, Button,
} from 'antd'
import { useRef } from 'react'
import { Content } from './Content'
import {
  CloseOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'

type ApprovalRejectionPopoverProps = {
  children: React.ReactNode;
  setOpen: (open: boolean) => void;
  isOpen: boolean;
  isLoading: boolean;
  clickHandler: (note: string) => void;
  placeholder: string;
  title: string;
  allowDisabling?: boolean;
}

export const ApprovalRejectionPopover = ({
  children, setOpen, isOpen, clickHandler, isLoading, placeholder, title, allowDisabling,
}: ApprovalRejectionPopoverProps) => {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  return (
    <Popover
      placement="bottom"
      content={(
        <Content
          setOpen={setOpen}
          clickHandler={clickHandler}
          isLoading={isLoading}
          placeholder={placeholder}
          allowDisabling={allowDisabling}
        />
    )}
      onOpenChange={(open) => {
        setOpen(open)
      }}
      open={isOpen}
      afterOpenChange={() => {
        if (isOpen && btnRef && btnRef?.current) {
          btnRef?.current?.focus()
        }
      }}
      trigger="click"
      title={() => (
        <Flex justify="space-between">
          <Typography.Title level={5} className="mt-0">
            {title}
          </Typography.Title>
          <Button
            style={{ border: 'none' }}
            onClick={() => {
              setOpen(false)
            }}
            ref={btnRef}
            icon={<CloseOutlined />}
          />
        </Flex>
      )}
    >
      {children}
    </Popover>
  )
}
