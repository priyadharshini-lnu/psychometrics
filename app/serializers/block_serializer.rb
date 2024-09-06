# frozen_string_literal: true

class BlockSerializer < Panko::Serializer
  attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions

  def questions
    Panko::ArraySerializer.new(
      object.questions_ams,
      each_serializer: QuestionSerializer,
      context: {
        piped_text_context: context[:piped_text_context]
      }
    ).to_a
  end

  def deleted
    !!object.deleted_at
  end

  def created_at
    I18n.l object.created_at, format: :short
  end

  def props
    return object.props unless object.props && object.props['staticContent']

    static_content =
      object.props['staticContent'].merge(
        'value' => Threesixty::PipedText::Perform.
          call!(object.props['staticContent']['value'], context[:piped_text_context])
      )
    object.props.merge('staticContent' => static_content)
  end
end
