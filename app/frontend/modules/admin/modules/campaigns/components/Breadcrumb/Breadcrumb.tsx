import React, { useEffect } from 'react'
import { Breadcrumb as AntBreadcrumb } from 'antd'
import { Request, State } from '~/modules/admin/core/ui/breadcrumbs'
import useTitle from '~/hooks/useTitle'
import styles from './styles.less'

interface Crumb {
  link?: (state: State) => string
  label: (state: State) => string | undefined
}

interface Props {
  fetch: (request: Request) => void
  request?: Request
  crumbs: Crumb[]
  state: State
}

const { I18n } = window

// FYI: if we have to add nested breadcrumbs later, we can extract `crumbs` into redux state
// and provide two action creators: `pushCrumbs([...])`, `replaceCrumbs([...])`
const Breadcrumb: React.FC<Props> = ({
  request, crumbs, fetch, state,
}) => {
  useEffect(() => {
    if (request) fetch(request)
  }, [JSON.stringify(request)])

  const crumbsForTitle = crumbs.slice(-2).map(({ label }) => label(state)).reverse()
  crumbsForTitle.push(`${I18n.t('frontend.lighthouse_app')}`)
  useTitle({ title: crumbsForTitle.join(' - ') })

  return (
    <div className={styles.container} data-testid="breadcrumbs">
      <AntBreadcrumb>
        {crumbs.map((crumb, index) => (
          <AntBreadcrumb.Item key={index}>
            {crumb.link ? (
              <a
                className={styles.breadcrumbLink}
                href={crumb.link(state)}
              >
                {crumb.label(state)}
              </a>
            ) : crumb.label(state)}
          </AntBreadcrumb.Item>
        ))
      }
      </AntBreadcrumb>
    </div>
  )
}

export default Breadcrumb
