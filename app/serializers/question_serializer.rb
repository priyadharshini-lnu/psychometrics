# frozen_string_literal: true

class QuestionSerializer < Panko::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at, :block_id,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id, :assessment_id

  def deleted
    !!object.deleted_at
  end

  def props
    return {} unless object.props
    return object.props unless object.props['questionText']

    if (translation_props = context.dig(:translations, 'question', object.id, 'props'))
      object.props = Utility::Hash.deep_merge(object.props, translation_props || {})
    end

    object.props.merge(
      questionText: Threesixty::PipedText::Perform.
        call!(object.props['questionText'], context[:piped_text_context])
    )
  end

  def validation
    return {} unless object.validation

    if (translation_props = context.dig(:translations, 'question', object.id, 'validation'))
      object.validation = Utility::Hash.deep_merge(object.validation, translation_props || {})
    end

    object.validation
  end
end
