import { useRef, useEffect } from 'react'
import _ from 'lodash'
import store from '~/modules/reports/store/PreviewStore'
import PageList from '~/modules/reports/store/PageList'
import LogicResolver from '~/modules/reports/models/logic/LogicResolver'
import Page from './Page'
import { ModuleOverrides } from './ModuleOverrides'
import useForceUpdate from '~/hooks/useUpdate'
import PaginationPage from '~/modules/reports/models/PaginationPage'

const { I18n } = window
const applyPagination = (pages, module, pagination) => {
  const page = pages.find(page => page.id === module.page.page.id)
  const index = pages.findIndex(page => page.id === module.page.page.id) + 1

  const repeatModules = module.props.pagination?.repeatableModules
    ? page.modules.list.filter(m => module.props.pagination.repeatableModules.includes(m.id))
    : []

  const insertedPages = pagination.pages.slice(1).map(
    pageData => new PaginationPage({ repeatModules }, module, pageData),
  )
  return [...pages.slice(0, index), ...insertedPages, ...pages.slice(index)]
}

const Preview = ({
  loaded, rstore, moduleOverrides, pdfExport, skipLogic, dashboard,
  allowEdit, allowApprove, flipContent,
}) => {
  const forceUpdate = useForceUpdate()
  const visiblePagesRef = useRef(null)

  useEffect(() => {
    const storeListener = store.addListener('change', () => forceUpdate())
    return () => {
      storeListener.remove()
    }
  }, [])

  useEffect(() => {
    visiblePagesRef.current = ((skipLogic
      ? PageList.list
      : _.filter(PageList.list, page => LogicResolver.run(page.displayLogic))))
    forceUpdate()
  }, [])

  const insertPaginationPage = (module, pagination) => {
    visiblePagesRef.current = (applyPagination(visiblePagesRef.current, module, pagination))
    forceUpdate()
  }
  if (!loaded || !visiblePagesRef.current) { return null }
  const visiblePages = visiblePagesRef.current

  return (
    <div
      role="region"
      aria-label={I18n.t('idp.report_preview')}
      style={{ position: 'relative', direction: 'ltr' }}
    >
      {visiblePages.map((page, i) => (
        <Page
          model={page}
          key={page.id}
          flipContent={flipContent}
          pageNumber={i + 1}
          totalPages={visiblePages.length}
          rstore={rstore}
          moduleOverrides={moduleOverrides}
          pdfExport={pdfExport}
          dashboard={dashboard}
          insertPaginationPage={insertPaginationPage}
        />
      ))}
      {!pdfExport && (
        <ModuleOverrides
          allowEdit={allowEdit}
          allowApprove={allowApprove}
          pages={visiblePages}
          rstore={rstore}
          moduleOverrides={moduleOverrides}
        />
      )}
    </div>
  )
}

export default Preview
