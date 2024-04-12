import React from 'react'
import {
  Button, MenuProps,
} from 'antd'
import { ToolOutlined, DownOutlined } from '@ant-design/icons'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import ConditionalDropdown from '~/components/ConditionalDropdown'

const { I18n } = window

type Persmission = {
  export: boolean,
  import: boolean
}

type Props = {
  onClick: (action: string) => void,
  persmission: Persmission,
}

export const Tools: React.FC<Props> = ({
  onClick, persmission,
}: Props) => (
  <ConditionalDropdown
    menu={getMenuProps({ onClick, persmission })}
    innerElement={(
      <Button>
        <ToolOutlined />
        <span>{I18n.t('administration.scoring.subject_list.tools')}</span>
        <DownOutlined />
      </Button>
      )}
    className="mrm"
    hideForEmptyMenu
  />
)

const getMenuProps = ({ onClick, persmission }: Props): MenuProps => {
  const menuItems:ItemType[] = []
  if (persmission?.export) {
    menuItems.push({
      key: 'export',
      label: I18n.t('administration.scoring.subject_list.export'),
    })
  }

  if (persmission?.import) {
    menuItems.push({
      key: 'import_external_scores',
      label: I18n.t('administration.scoring.subject_list.import_external_scores'),
    })
  }

  const handleMenuClick = ({ key }) => {
    onClick(key)
  }

  return ({ items: menuItems, onClick: handleMenuClick })
}
