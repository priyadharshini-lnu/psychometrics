# frozen_string_literal: true

class BlockSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :deleted, :props, :created_at, :template_id, :questions

  def questions
    object.questions_ams.map do |q|
      QuestionSerializer.new(q, piped_text_context: @instance_options[:piped_text_context])
    end
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
          call!(object.props['staticContent']['value'], @instance_options[:piped_text_context])
      )
    object.props.merge('staticContent' => static_content)
  end
end
