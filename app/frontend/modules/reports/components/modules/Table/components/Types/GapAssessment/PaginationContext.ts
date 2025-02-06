import Module from 'modules/reports/core/interfaces/Module'

export interface PageData {
  rowIds: {
    top: string[]
    bottom: string[]
  }
  index: number
}

const TABLE_PADDING = 16

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
    const rootRect = this.root.getBoundingClientRect()
    const rows = this.root.querySelectorAll('tbody tr')

    let headerheight = 0
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].getAttribute('data-header')) {
        headerheight += rows[i].getBoundingClientRect().height
      } else {
        break
      }
    }
    const containerHeight = this.module.props.position.height - TABLE_PADDING
    const secondPageContentHeight = (this.module.props.pagination?.position?.height || 1000) - TABLE_PADDING

    if (containerHeight > rootRect.height) {
      return
    }

    let page:PageData = {
      rowIds: {
        top: [],
        bottom: [],
      },
      index: this.pages.length,
    }
    this.pages.push(page)
    let currentPageHeight = 0
    rows.forEach((row) => {
      const rowRect = row.getBoundingClientRect()
      if (row.getAttribute('data-header')) {
        currentPageHeight += rowRect.height
        return
      }

      const id = row.getAttribute('data-row')
      const type = row.getAttribute('data-type')
      if (!id || !type) { return }
      const maxHeight = this.pages.length > 1 ? secondPageContentHeight : containerHeight
      if (currentPageHeight + rowRect.height > maxHeight && (page.rowIds.top.length || page.rowIds.bottom.length)) {
        this.needPagination = true
        page = {
          rowIds: {
            top: [],
            bottom: [],
            [type]: [id],
          },
          index: this.pages.length,
        }
        this.pages.push(page)
        currentPageHeight = headerheight + rowRect.height
      } else {
        page.rowIds[type].push(id)
        currentPageHeight += rowRect.height
      }
    })
  }
}
