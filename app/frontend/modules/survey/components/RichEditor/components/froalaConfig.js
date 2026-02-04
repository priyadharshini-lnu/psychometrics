import FroalaEditor from 'froala-editor'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/xml/xml'
import embedMedia from '~/modules/survey/commands/froalaCommands/embedMedia'
import events from '~/components/Editor/events'
import { FROALA } from '~/constants/froala.ts'
import { getFeatures } from '~/modules/reports/utils/features'
import { camelizeKeys } from '~/utils/object'

FroalaEditor.PLUGINS.embedMedia = embedMedia

export default {
  iconsTemplate: 'font_awesome',
  imageUpload: false,
  codeMirror: CodeMirror,
  pluginsEnabled: [
    'lists', 'image', 'link', 'fontFamily',
    'fontSize', 'colors', 'paragraphFormat',
    'align', 'quote', 'table', 'video', 'embedMedia', 'codeView', 'audio'],
  toolbarButtons: [
    'pipedText',
    'fontFamily',
    'fontSize',
    'textColor',
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
    'align',
    'outdent',
    'indent',
    'quote',
    'insertLink',
    'insertImage',
    'insertTable',
    'insertHR',
    'clearFormatting',
    'help',
    'undo',
    'redo',
    'insertVideo',
    'embedMedia',
    'insertAudio',
    'html',
  ],
  // saveParams: { type },
  width: '100%',
  height: '100%',
  key: FROALA,
  attribution: false,
  autofocus: true,
  toolbarSticky: false,
  videoInsertButtons: ['videoByURL', '|', 'videoEmbed'],
  pasteDeniedAttrs: ['style'],
  tableStyles: {
    'table-no-border': 'No Border',
    'table-minimal-hr': 'Minimal',
    'table-compact': 'Compact',
    'table-full-width': 'Full Width',
    'fr-dashed-borders': 'Dashed Borders',
    'fr-alternate-rows': 'Alternate Rows',
  },
  tableCellStyles: {
    'table-cell-header': 'Header',
    'fr-highlighted': 'Highlighted',
    'fr-thick': 'Thick',
  },
  htmlAllowedAttrs: [...FroalaEditor.DEFAULTS.htmlAllowedAttrs, 'aria-.*', 'role'],
  imageStyles: {
    'zoom-image': 'Zoom Image',
  },
  events: {
    'video.codeError': function (code) {
      events.video_code_error(this, code)
    },
    'video.linkError': function (link) {
      events.video_link_error(this, link)
    },
    initialized () {
      // WEBSPELLCHECKER is loaded via backend when ENABLE_WEBSPELLCHECKER env is true
      /* eslint-disable */
      const features = camelizeKeys(getFeatures())
      if (features.enableWebspellchecker) {
        WEBSPELLCHECKER.init({
          container: this.$iframe ? this.$iframe[0] : this.el,
        })
      }
    },
  },
}
