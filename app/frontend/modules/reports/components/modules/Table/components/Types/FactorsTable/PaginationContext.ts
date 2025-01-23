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

    const secondPageHeight = (this.module.props.pagination?.position?.height || 1000) - headerheight

    const contentHeight = containerHeight - headerheight

    const rootRect = this.root.getBoundingClientRect()

    if (containerHeight > rootRect.height) {
      return
    }

    const firstLevel = this.root.querySelectorAll('[data-paginatable="1"]')
    let page:PageData = {
      factorIds: [],
      index: this.pages.length,
    }
    this.pages.push(page)

    let currentPageHeight = 0
    firstLevel.forEach((filterElement) => {
      const factorRow = filterElement.getBoundingClientRect()
      const factorId = filterElement.getAttribute('data-factor-id')
      if (!factorId) { return }

      const maxHeight = this.pages.length > 1 ? secondPageHeight : contentHeight
      if (currentPageHeight + factorRow.height > maxHeight) {
        this.needPagination = true
        page = {
          factorIds: [factorId],
          index: this.pages.length,
        }
        this.pages.push(page)
      } else {
        page.factorIds.push(factorId)
        currentPageHeight += factorRow.height
      }
    })
  }
}
