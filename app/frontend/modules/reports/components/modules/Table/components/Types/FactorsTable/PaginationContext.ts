import Module from 'modules/reports/core/interfaces/Module'

interface PageData {
  factorIds: string[]
  index: number
}

export class PaginationContext {
  module: Module

  needPagination: boolean

  root: Element

  pages: PageData[]

  constructor (module, root) {
    this.module = module
    this.root = root

    this.pages = []
    this.needPagination = false

    this.splitInPages()
  }


  splitInPages () {
    const containerHeight = this.module.props.position.height
    const headerheight = this.root.querySelector('[data-table-header]')?.getBoundingClientRect()?.height || 0
    const legendHeight = this.root.querySelector('[data-legend]')?.getBoundingClientRect()?.height || 0

    const secondPageHeight = (this.module.props.pagination?.position?.height || 1000) - headerheight - legendHeight

    const contentHeight = containerHeight - headerheight - legendHeight

    const rootRect = this.root.getBoundingClientRect()

    if (containerHeight > rootRect.height) {
      return
    }

    const rows = this.root.querySelectorAll('[data-row]')
    let page:PageData = {
      factorIds: [],
      index: this.pages.length,
    }
    this.pages.push(page)

    let currentPageHeight = 0
    rows.forEach((filterElement) => {
      const factorRow = filterElement.getBoundingClientRect()
      const factorId = filterElement.getAttribute('data-factor-id')
      if (!factorId) { return }

      const maxHeight = this.pages.length > 1 ? secondPageHeight : contentHeight
      if (page.factorIds.length && (currentPageHeight + factorRow.height > maxHeight) && page.factorIds.length) {
        this.needPagination = true
        page = {
          factorIds: [factorId],
          index: this.pages.length,
        }
        this.pages.push(page)
        currentPageHeight = factorRow.height
      } else {
        page.factorIds.push(factorId)
        currentPageHeight += factorRow.height
      }
    })
  }
}
