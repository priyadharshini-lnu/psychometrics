import _ from 'lodash'

export class BlockSerializer {
  static wrap (attrs) {
    if (!attrs) {
      return null
    }
    const block = {}
    block.id = attrs.id
    block.name = attrs.name
    block.position = attrs.position
    block.deleted = attrs.deleted || false
    block.saveAsTemplate = attrs.save_as_template || false
    block.templateId = attrs.template_id
    block.deletedAt = attrs.deleted_at
    if (_.isEmpty(attrs.props)) {
      block.props = { randomization: { type: 'No' }, buttons: { prev_button: 'Previous', next_button: 'Next' } }
    } else {
      block.props = attrs.props
    }
    block.questions = attrs.questions || []

    return block
  }

  static toJSON (block) {
    return {
      id: block.isNew ? undefined : block.id,
      name: block.name,
      position: block.position,
      props: block.props,
      template_id: block.templateId,
      save_as_template: block.saveAsTemplate,
      deleted_at: block.deletedAt,
      questions: block.questions,
    }
  }
}

export default BlockSerializer
