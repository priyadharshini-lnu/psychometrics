# frozen_string_literal: true

# == Schema Information
#
# Table name: questions
#
#  id                  :integer          not null, primary key
#  name                :string
#  position            :integer
#  type                :string
#  props               :json
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  block_id            :integer
#  deleted_at          :datetime
#  required_validation :json
#  validation          :json
#  display_logic       :json
#  skip_logic          :json
#  view                :integer          default("assessments")
#  disabled            :boolean          default(FALSE)
#  template_id         :integer
#  assessment_id       :integer
#

class QuestionSerializer < ActiveModel::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id

  has_many :comments, serializer: CommentSerializer

  def deleted
    !!object.deleted_at
  end

  def props
    return object.props unless object.props['questionText']

    object.props.merge(questionText: Threesixty::PipedText::Perform.call!(object.props['questionText'], @instance_options[:piped_text_context]))
  end
end
