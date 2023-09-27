import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import QuestionList from '~/modules/survey/views/Preview/QuestionList'
import Utils from '~/modules/survey/utils/Utils'
import StaticContent from '~/modules/survey/views/Preview/StaticContent'
import { LEFT, RIGHT } from '~/modules/survey/views/Block/components/StaticContent/settings'
import Footer from './PageFooter'
import styles from './Page.less'

class Page extends Component {
  static propTypes = {
    page: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const path = location.pathname.match('threesixty_campaigns/(.*)/evaluations')
    if (path) {
      const { fetchCampaignOptions } = this.props
      fetchCampaignOptions(parseInt(path[1], 10))
    }

    this.ref.addEventListener('copy', this.disableCopyHandler)
    this.ref.addEventListener('cut', this.disableCopyHandler)
    this.ref.addEventListener('contextmenu', this.disableCopyHandler)
  }

  componentWillUnmount () {
    this.ref.removeEventListener('copy', this.disableCopyHandler)
    this.ref.removeEventListener('cut', this.disableCopyHandler)
    this.ref.removeEventListener('contextmenu', this.disableCopyHandler)
  }

  componentDidUpdate (prevProps) {
    const { page } = this.props
    if (page !== prevProps.page) {
      window.scrollTo(0, 0)
    }
  }


  getBlockClasses () {
    const { block: { props: { staticContent } } } = this.props

    if (!staticContent) return
    const { layout } = staticContent
    return cs({ [styles.blockWithSideStaticContent]: (layout === LEFT || layout === RIGHT) })
  }

  getQuestionContainerClasses () {
    const { block: { props: { staticContent } } } = this.props

    if (!staticContent) return
    const { layout } = staticContent
    return cs({
      [styles.sideStaticContent]: (layout === LEFT || layout === RIGHT),
      [styles.rightStaticContent]: (layout === RIGHT),
    })
  }

  disableCopyHandler = (event) => {
    const { target } = event
    const copyEnabled = target.closest('[data-allow-content-copy="1"]')
    if (copyEnabled || ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    return false
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  scroll = (hash) => {
    Utils.scroll(hash)
  }

  renderErrors () {
    const { errors, I18n } = this.props
    const validationTitle = I18n.t('validations.title', { count: Object.keys(errors).length })
    const styleForTitle = this.addLtrStyleIfNeed(validationTitle)
    return (
      <div className={styles.errors}>
        <h1 style={styleForTitle}>{validationTitle}</h1>
      </div>
    )
  }

  render () {
    const {
      page, questions, errors, nextPage, preview, prevPage, hasPrevPage,
      block: {
        props: { staticContent },
        id: blockId,
      },
      preview: {
        ignoreValidation, readOnly, type,
        backButtonPressed,
      },
      isDisconnected,
    } = this.props
    if (!page) { return }
    return (
      <div
        ref={(ref) => { this.ref = ref }}
        className={cs(this.getBlockClasses(), styles.block, `fe-ass-page-container-${type}`)}
      >
        {readOnly && <div className={styles.readOnly}>Is read only mode, you can not change any results.</div>}
        <div className={this.getQuestionContainerClasses()}>
          {staticContent && <StaticContent key={blockId} />}
          <div className={cs(styles.questionsBlock, { staticBlockQuestionList: staticContent })}>
            {!ignoreValidation && !_.isEmpty(errors) && this.renderErrors(page)}
            <QuestionList
              readOnly={readOnly}
              page={page}
              questions={questions}
              backButtonPressed={backButtonPressed}
              nextPage={nextPage}
            />
          </div>
        </div>
        {type !== 'preview_block' && (
          <Footer
            preview={preview}
            hasPrevPage={hasPrevPage}
            page={page}
            prevPage={prevPage}
            nextPage={nextPage}
            isDisconnected={isDisconnected}
          />
        )}
      </div>
    )
  }
}

export default Page
