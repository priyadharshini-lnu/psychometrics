import Module from 'modules/reports/core/interfaces/Module'

interface PageData {
  filterId: number[]
  index: number
}

export class FactorPaginationContext {
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

    const secondPageHeight = this.module.props.pagination?.position?.height || 1000

    const contentHeight = containerHeight

    const rootRect = this.root.getBoundingClientRect()

    if (containerHeight > rootRect.height) {
      return
    }

    const firstLevel = this.root.querySelectorAll('[data-paginatable]')
    let page:PageData = {
      filterId: [],
      index: this.pages.length,
    }
    this.pages.push(page)

    let currentPageHeight = 0

    firstLevel.forEach((factorElement) => {
      const filterTable = factorElement.getBoundingClientRect()
      const filterId = parseInt(factorElement.getAttribute('data-filter-id') || '', 10)

      const maxHeight = this.pages.length > 1 ? secondPageHeight : contentHeight
      if (currentPageHeight + filterTable.height > maxHeight && page.filterId.length) {
        this.needPagination = true
        page = {
          filterId: [filterId],
          index: this.pages.length,
        }
        this.pages.push(page)
        currentPageHeight = filterTable.height
      } else {
        if (!page.filterId.includes(filterId)) {
          page.filterId.push(filterId)
        }
        currentPageHeight += filterTable.height
      }
    })
  }
}
