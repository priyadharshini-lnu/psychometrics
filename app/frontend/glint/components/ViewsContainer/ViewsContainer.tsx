import React, {
  FC, useEffect, useContext,
} from 'react'
import {
  Row, Col, Typography, Space,
} from 'antd'
import { TitleProps } from 'antd/es/typography/Title'
import { UnorderedListOutlined, AppstoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { useLocalStorage } from '~/hooks/useLocalStorage'
import { MediaQueryContext, ScrollToViewOnFocusButton } from '~/glint'

import styles from './styles.less'

const { Title } = Typography
const { I18n } = window

const VIEW_TYPE = {
  list: 'list',
  grid: 'grid',
}

type ViewsContainerProps = {
  title: string
  titleHeadingLevel?: TitleProps['level']
  onViewChange?: (activeView: string) => void
  children: (view: string) => React.ReactElement | React.ReactNode
  defaultView?: 'list' | 'grid'
  viewTypeStorageKey?: string
  className?: string
}

export const ViewsContainer: FC<ViewsContainerProps> = ({
  onViewChange, title, titleHeadingLevel, children, defaultView = 'list', viewTypeStorageKey = 'listType', className,
}) => {
  const [view, setView] = useLocalStorage<string>(viewTypeStorageKey, defaultView)
  const { isMobile } = useContext(MediaQueryContext) || { isMobile: null }

  useEffect(() => {
    onViewChange && onViewChange(view)
  }, [view])

  const listSelected = view === VIEW_TYPE.list
  const gridSelected = view === VIEW_TYPE.grid

  return (
    <>
      <div className={className}>
        <Row gutter={20}>
          <Col span={12}>
            <Title level={titleHeadingLevel} className={styles.title}>
              {title}
            </Title>
          </Col>
          { !isMobile && (
            <Col span={12} className={styles.viewControls}>
              <Space>
                <ScrollToViewOnFocusButton
                  className={gridSelected ? styles.activeButton : styles.inActiveButton}
                  id={VIEW_TYPE.grid}
                  onClick={() => setView(VIEW_TYPE.grid)}
                  shape="circle"
                  icon={<AppstoreOutlined aria-label="" />}
                  size="middle"
                  aria-label={I18n.t('glint.views_container.aria_grid_view')}
                  aria-description={gridSelected ? I18n.t('glint.views_container.aria_selected') : ''}
                />
                <ScrollToViewOnFocusButton
                  className={listSelected ? styles.activeButton : styles.inActiveButton}
                  id={VIEW_TYPE.list}
                  shape="circle"
                  onClick={() => setView(VIEW_TYPE.list)}
                  icon={<UnorderedListOutlined aria-label="" />}
                  size="middle"
                  aria-label={I18n.t('glint.views_container.aria_list_view')}
                  aria-description={listSelected ? I18n.t('glint.views_container.aria_selected') : ''}
                />
              </Space>
            </Col>
          )}
        </Row>
      </div>
      {children(view)}
    </>
  )
}
