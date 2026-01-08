import { forwardRef, useRef } from 'react'
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
import Froala from 'froala-editor'
import FroalaEditor from 'react-froala-wysiwyg'
import '~/libs/Editor/commands/rtlLtr'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import 'froala-editor/js/languages/cs'
import 'froala-editor/js/languages/ar'
import 'froala-editor/js/languages/pl'
import 'froala-editor/js/languages/it'
import 'froala-editor/js/languages/es'
import 'froala-editor/js/languages/fr'
import 'froala-editor/js/languages/de'
import 'froala-editor/js/languages/ja'
import 'froala-editor/js/languages/zh_cn'
import 'froala-editor/js/languages/zh_tw'
import styles from './ReflectiveQuestions.less'
import { FROALA } from '~/constants/froala.ts'

const { I18n } = window

function Editor ({
  content, handleContentChange, readOnly = false, maxCharacterLimit = null, maxWordLimit = null,
}) {
  const ref = useRef()
  if (Froala.LANGUAGE[I18n.currentLocale()]) {
    Froala.LANGUAGE[I18n.currentLocale()].translation.Words = I18n.t('idp.reflective_questions.words')
  }
  const config = {
    iconsTemplate: 'font_awesome',
    pluginsEnabled: [
      'charCounter',
      'wordCounter',
    ],
    toolbarButtons: [],
    events: {
      initialized () {
        // setTimeout is because there is a bug in v3 that
        // calls initialized before editor has finished initializing
        setTimeout(() => {
          // eslint-disable-next-line react/no-this-in-sfc
          readOnly ? this.edit.off() : this.edit.on()
        })
      },
    },
    language: I18n.currentLocale(),
    pastePlain: true,
    heightMin: 50,
    heightMax: 500,
    charCounterCount: true,
    wordCounterCount: true,
    key: FROALA,
    attribution: false,
    toolbarSticky: false,
    placeholderText: I18n.t('idp.reflective_questions.answer_placeholder'),
  }

  if (maxCharacterLimit) {
    config.charCounterMax = maxCharacterLimit
  }
  if (maxWordLimit) {
    // Froala editor have some issue with wordCounterMax https://github.com/froala/wysiwyg-editor/issues/4767
    // Will be uncommented when this is fixed
    // config.wordCounterMax = maxWordLimit
  }

  const onChange = (newContent) => {
    let wordCount = 0
    if (ref.current?.editor) {
      wordCount = ref.current.editor.wordCounter.wordCount()
    }
    handleContentChange(newContent, wordCount)
  }

  return (
    <div className={styles.editor}>
      <FroalaEditor ref={ref} config={config} model={content} onModelChange={onChange} />
    </div>
  )
}

export default forwardRef(Editor)
