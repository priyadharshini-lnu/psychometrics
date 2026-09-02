import React, { useEffect } from 'react'
import { Breadcrumb as AntBreadcrumb, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { Request, State } from '~/modules/admin/core/ui/breadcrumbs'
import { useIsOwnedPath } from '~/components/AdminShell/ownedPaths'
import styles from './styles.less'
import { DocumentTitle } from '~/components/DocumentTitle'

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

const Breadcrumb: React.FC<Props> = ({
  request, crumbs, fetch, state,
}) => {
  const isOwned = useIsOwnedPath()

  useEffect(() => {
    if (request) fetch(request)
  }, [JSON.stringify(request)])

  const resolvedCrumbs = crumbs.flatMap((crumb) => {
    const label = crumb.label(state)

    return label ? [{ crumb, label }] : []
  })

  const crumbsForTitle = resolvedCrumbs.slice(-2).map(({ label }) => label).reverse()

  const breadcrumbItems = resolvedCrumbs.map(({ crumb, label }) => {
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
      <DocumentTitle text={crumbsForTitle.join(' - ')} />
      <AntBreadcrumb items={breadcrumbItems} />
    </div>
  )
}

export default Breadcrumb
