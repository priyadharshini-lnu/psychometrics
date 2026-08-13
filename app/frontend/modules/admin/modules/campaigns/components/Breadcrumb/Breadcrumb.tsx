import React, { useEffect } from 'react'
import { Breadcrumb as AntBreadcrumb, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { Request, State } from '~/modules/admin/core/ui/breadcrumbs'
import useTitle from '~/hooks/useTitle'
import { useIsOwnedPath } from '~/components/AdminShell/ownedPaths'
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
  const isOwned = useIsOwnedPath()

  useEffect(() => {
    if (request) fetch(request)
  }, [JSON.stringify(request)])

  const crumbsForTitle = crumbs.slice(-2).map(({ label }) => label(state)).reverse()
  crumbsForTitle.push(`${I18n.t('frontend.lighthouse_app')}`)
  useTitle({ title: crumbsForTitle.join(' - ') })

  const breadcrumbItems = crumbs.map((crumb) => {
    const label = crumb.label(state)

    const tags = request?.fields
      ?.map(field => state[field as keyof State] as { name?: string; tags?: string[] })
      ?.find(resource => resource?.name === label)
      ?.tags || []

    const titleContent = tags.length > 0 ? (
      <span className={styles.breadcrumbItem}>
        <span>{label}</span>
        {tags.length > 0 && (
          <span>
            {tags.map((tag, index) => (
              <Tag
                key={index}
                color="gold"
              >
                {tag}
              </Tag>
            ))}
          </span>
        )}
      </span>
    ) : label

    if (!crumb.link) return { title: titleContent }

    // Several apps mount this breadcrumb, each with its own router — only a path that router owns can be pushed.
    const href = crumb.link(state)

    return {
      title: isOwned(href) ? (
        <Link className={styles.breadcrumbLink} to={href}>
          {titleContent}
        </Link>
      ) : (
        <a className={styles.breadcrumbLink} href={href}>
          {titleContent}
        </a>
      ),
    }
  })

  return (
    <div className={styles.container} data-testid="breadcrumbs">
      <AntBreadcrumb items={breadcrumbItems} />
    </div>
  )
}

export default Breadcrumb
