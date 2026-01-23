import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/xml/xml'
import events from '~/components/Editor/events'
import { FROALA } from '~/constants/froala.ts'

export default {
  iconsTemplate: 'font_awesome',
  imageUpload: false,
  codeMirror: CodeMirror,
  pluginsEnabled: [
    'lists', 'image', 'link', 'fontFamily',
    'fontSize', 'colors', 'paragraphFormat',
    'align', 'quote', 'table', 'video', 'codeView',
  ],
  toolbarContainer: '#froala-editor-toolbar',
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
    'html',
  ],
  // saveParams: { type },
  width: '100%',
  height: '100%',
  key: FROALA,
  attribution: false,
  autofocus: true,
  videoInsertButtons: ['videoByURL', '|', 'videoEmbed'],
  pasteDeniedAttrs: ['style'],
  events: {
    'video.codeError': function (code) {
      events.video_code_error(this, code)
    },
    'video.linkError': function (link) {
      events.video_link_error(this, link)
    },
  },
}
