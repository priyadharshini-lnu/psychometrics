// Source: https://www.froala.com/wysiwyg-editor/examples/rtl-ltr-custom-button

import FroalaEditor from 'froala-editor'

function changeDirection (dir, align) {
  // Wrap block tags.
  this.selection.save()
  this.html.wrap(true, true, true, true)
  this.selection.restore()

  // Get blocks.
  const elements = this.selection.blocks()

  // Save selection to restore it later.
  this.selection.save()

  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i]
    if (element !== this.el) {
      this.$(element)
        .css('direction', dir)
        .css('text-align', align)
        .removeClass('fr-temp-div')
    }
  }

  // Unwrap temp divs.
  this.html.unwrap()

  // Restore selection.
  this.selection.restore()
}

FroalaEditor.DefineIcon('rightToLeft', { NAME: 'long-arrow-left' })
FroalaEditor.RegisterCommand('rightToLeft', {
  title: 'RTL',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    changeDirection.apply(this, ['rtl', 'right'])
  },
})

FroalaEditor.DefineIcon('leftToRight', { NAME: 'long-arrow-right' })
FroalaEditor.RegisterCommand('leftToRight', {
  title: 'LTR',
  focus: true,
  undo: true,
  refreshAfterCallback: true,
  callback () {
    changeDirection.apply(this, ['ltr', 'left'])
  },
})
