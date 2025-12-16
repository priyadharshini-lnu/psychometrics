import {
  forwardRef, useState, useEffect, useRef,
} from 'react'
import { message } from 'antd'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import FroalaEditor from 'react-froala-wysiwyg'
import '~/libs/Editor/commands/rtlLtr'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

const { I18n } = window

function Editor ({
  content, handleContentChange, readOnly = false,
  maxCharacterLimit = null, maxWordLimit = null, enhanceWithAIEnabled = true,
}, ref) {
  const [isInitialized, setIsInitialized] = useState(false)
  const showLimitExceededMessageRef = useRef(false)

  const config = {
    iconsTemplate: 'font_awesome',
    pluginsEnabled: [
      'lists',
      'paragraphFormat',
      'fullscreen',
      'charCounter',
      'wordCounter',
    ],
    toolbarButtons: [
      'bold',
      'italic',
      'underline',
      'strikeThrough',
      'subscript',
      'superscript',
      'formatOL',
      'formatUL',
      'rightToLeft',
      'leftToRight',
      'paragraphFormat',
      'outdent',
      'indent',
      'clearFormatting',
      'fullscreen',
    ],
    events: {
      initialized () {
        // setTimeout is because there is a bug in v3 that
        // calls initialized before editor has finished initializing
        setTimeout(() => {
          // eslint-disable-next-line react/no-this-in-sfc
          readOnly ? this.edit.off() : this.edit.on()
        })
      },
      'charCounter.exceeded': function () {
        if (showLimitExceededMessageRef.current) {
          message.error(I18n.t('shared.rte_paste_content_exceeds_char_limit', { maxCharacterLimit }))
          showLimitExceededMessageRef.current = false
        }
      },
      'wordCounter.exceeded': function () {
        if (showLimitExceededMessageRef.current) {
          message.error(I18n.t('shared.rte_paste_content_exceeds_word_limit', { maxWordLimit }))
          showLimitExceededMessageRef.current = false
        }
      },
      'paste.before': function () {
        showLimitExceededMessageRef.current = true
      },
      'paste.after': function () {
        showLimitExceededMessageRef.current = false
      },
    },
    heightMin: 50,
    heightMax: 500,
    charCounterCount: true,
    wordCounterCount: true,
    key: 'DUA2yE2C2F1A6A3A2A3qYFd1UQRFQIVb1MSMc2IWPNe1IFg1yD4C3D2C1C4C1H1H4B1D2==',
    attribution: false,
    toolbarSticky: false,
    pasteDeniedAttrs: ['style'],
  }

  if (maxCharacterLimit) {
    config.charCounterMax = maxCharacterLimit
  }
  if (maxWordLimit) {
    // Froala editor have some issue with wordCounterMax https://github.com/froala/wysiwyg-editor/issues/4767
    // Will be uncommented when this is fixed
    // config.wordCounterMax = maxWordLimit
  }

  useEffect(() => {
    async function initPlugins () {
      // Refer: https://github.com/froala/react-froala-wysiwyg/issues/410#issuecomment-2627465406
      // Import  Froala Editor plugin lazily;
      await import('froala-editor/js/plugins.pkgd.min')
      setIsInitialized(true)
    }
    if (!isInitialized) {
      initPlugins()
    }
  })

  return (
    <div className="classname" {...(enhanceWithAIEnabled && { 'data-ai-enabled': 'true' })}>
      {isInitialized && <FroalaEditor ref={ref} config={config} model={content} onModelChange={handleContentChange} />}
    </div>
  )
}

export default forwardRef(Editor)
