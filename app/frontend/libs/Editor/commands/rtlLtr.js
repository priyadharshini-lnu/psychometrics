// Source: https://www.froala.com/wysiwyg-editor/examples/rtl-ltr-custom-button

import FroalaEditor from 'froala-editor'

function changeDirection (className, align) {
  // Wrap block tags.
  const {
    type: selectionType,
    baseNode,
    baseNode: { parentNode },
    extentNode,
    baseOffset,
    extentOffset,
  } = this.selection.get()

  const isSingleNodeSelected = baseNode === extentNode
  const isAllElementTextSelected = (baseOffset === 0 && baseNode.length === extentOffset)
                            || (extentOffset === 0 && extentNode.length === baseOffset)
  if (isSingleNodeSelected) {
    if (selectionType === 'Range' && isAllElementTextSelected === false) {
      this.format.apply('span', { dir: className })
      return
    }
    const isElementSpanWithDir = this.$(parentNode).attr('dir') && parentNode.tagName.toLowerCase() === 'span'
    if ((selectionType === 'Caret' || isAllElementTextSelected) && isElementSpanWithDir) {
      this.$(parentNode).attr('dir', className)
      return
    }
  }

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
        .attr('dir', className)
        .css('text-align', align)
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
  refresh: function refresh ($btn) {
    const format = this.format.is('', { dir: 'rtl' })
    $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
  },
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
  refresh: function refresh ($btn) {
    const format = this.format.is('', { dir: 'ltr' })
    $btn.toggleClass('fr-active', format).attr('aria-pressed', format)
  },
  callback () {
    changeDirection.apply(this, ['ltr', 'left'])
  },
})
