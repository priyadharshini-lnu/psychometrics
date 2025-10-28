# frozen_string_literal: true

class BlockSerializer < Panko::Serializer
  attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions, :block_type

  def questions
    Panko::ArraySerializer.new(
      question_items,
      each_serializer: skill_rater? ? ::SkillRaterQuestionSerializer : ::QuestionSerializer,
      context: {
        piped_text_context: context[:piped_text_context],
        selected_locale: context[:selected_locale],
        translations: context[:translations],
        block: object
      }
    ).to_a
  end

  def question_items
    skill_rater? ? skill_questions : object.questions_ams
  end

  def deleted
    !!object.deleted_at
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def skill_rater?
    object.block_type == 'skill_rater'
  end

  def props
    return object.props unless object.props && object.props['staticContent']

    if (translation_props = context.dig(:translations, 'block', object.id, 'props'))
      object.props = Utility::Hash.deep_merge(object.props, translation_props || {})
    end

    static_content =
      object.props['staticContent'].merge(
        'value' => Threesixty::PipedText::Perform.
          call!(object.props['staticContent']['value'], context[:piped_text_context])
      )
    object.props.merge('staticContent' => static_content)
  end

  def campaign_user
    context[:campaign_user]
  end

  def skill_questions
    return [] unless campaign_user

    result = ::Skills::GetQuestions.call!(object.props['skills_config'], campaign_user)
    result[:questions]
  end
end
