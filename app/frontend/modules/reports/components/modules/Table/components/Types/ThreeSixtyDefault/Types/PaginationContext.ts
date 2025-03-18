import _ from 'lodash'
import Module from 'modules/reports/core/interfaces/Module'

interface PageData {
  filterId: number[]
  resultIndexes: {[filter: number]: number[]}
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
      filterId: [],
      resultIndexes: {},
      index: this.pages.length,
    }
    this.pages.push(page)

    let currentPageHeight = 0
    firstLevel.forEach((filterElement) => {
      const filterTable = filterElement.getBoundingClientRect()
      const filterId = parseInt(filterElement.getAttribute('data-filter-id') || '', 10)

      const maxHeight = (this.pages.length > 1 ? secondPageHeight : contentHeight)

      const secondLevel = filterElement.querySelectorAll("[data-paginatable='2']")
      const filterHeight = filterElement.querySelector('[data-filter-header]')?.getBoundingClientRect()?.height || 0
      if (currentPageHeight + filterTable.height > maxHeight) {
        this.needPagination = true
        secondLevel.forEach((rowElement, index) => {
          const maxHeight = (this.pages.length > 1 ? secondPageHeight : contentHeight)

          const rect = rowElement.getBoundingClientRect()
          const expectedHeight = currentPageHeight + rect.height
          if (_.isEmpty(page.resultIndexes)) {
            page.filterId = [filterId]
            page.resultIndexes = { [filterId]: [index] }
            currentPageHeight = filterHeight + rect.height
            return
          }
          if (expectedHeight > maxHeight) {
            page = {
              filterId: [filterId],
              resultIndexes: { [filterId]: [index] },
              index: this.pages.length,
            }
            this.pages.push(page)

            currentPageHeight = filterHeight + rect.height
          } else {
            if (!page.filterId.includes(filterId)) {
              page.filterId.push(filterId)
            }
            page.resultIndexes[filterId] = page.resultIndexes[filterId] || []
            page.resultIndexes[filterId].push(index)
            currentPageHeight += rect.height
          }
        })
      } else {
        if (!page.filterId.includes(filterId)) {
          page.filterId.push(filterId)
        }
        page.resultIndexes[filterId] = _.times(secondLevel.length, i => i)
        currentPageHeight += filterTable.height
      }
    })
  }
}
