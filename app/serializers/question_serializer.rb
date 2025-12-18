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

    question_text = object.props['questionText']

    unless ignore_pipetext_substitution?
      question_text = Threesixty::PipedText::Perform.call!(question_text, context[:piped_text_context])
    end
    object.props.merge('questionText' => question_text)
  end

  def validation
    return {} unless object.validation

    if (translation_props = context.dig(:translations, 'question', object.id, 'validation'))
      object.validation = Utility::Hash.deep_merge(object.validation, translation_props || {})
    end

    object.validation
  end

  private

  def ignore_pipetext_substitution?
    context[:ignore_pipetext_substitution] || false
  end
end
