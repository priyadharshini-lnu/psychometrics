import FroalaEditor from 'froala-editor'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/xml/xml'
import embedMedia from 'libs/survey/commands/froalaCommands/embedMedia'

FroalaEditor.PLUGINS.embedMedia = embedMedia

export default {
  iconsTemplate: 'font_awesome',
  imageUpload: false,
  codeMirror: CodeMirror,
  pluginsEnabled: [
    'lists', 'image', 'link', 'fontFamily',
    'fontSize', 'colors', 'paragraphFormat',
    'align', 'quote', 'table', 'video', 'embedMedia', 'codeView'],
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
    'html',
  ],
  // saveParams: { type },
  width: '100%',
  height: '100%',
  key: '7MD3aC3A2C4B4D4A2xROKLJKYHROLDXDRE1b1YYGRi1Bd1C4F4B3H3G3A15A13A12C4C4==',
  attribution: false,
  autofocus: true,
  toolbarSticky: false,
  videoInsertButtons: ['videoByURL', '|', 'videoEmbed'],
}
