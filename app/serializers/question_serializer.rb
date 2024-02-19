# frozen_string_literal: true

class QuestionSerializer < Panko::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id, :assessment_id

  has_many :comments, each_serializer: CommentSerializer

  def deleted
    !!object.deleted_at
  end

  def props
    return {} unless object.props
    return object.props unless object.props['questionText']

    object.props.merge(
      questionText: Threesixty::PipedText::Perform.
        call!(object.props['questionText'], context[:piped_text_context])
    )
  end
end
