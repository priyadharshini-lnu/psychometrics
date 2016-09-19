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
#  view                :integer          default("assessments")
#  disabled            :boolean          default(FALSE)
#  template_id         :integer
#  skip_logic          :json
#

class QuestionSerializer < ActiveModel::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at,
             :validation, :required_validation, :display_logic, :skip_logic, :template_id

  has_many :comments, serializer: CommentSerializer

  def deleted
    !!object.deleted_at
  end
end
