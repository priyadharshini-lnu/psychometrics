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
#

class QuestionSerializer < ActiveModel::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at,
             :validation, :required_validation, :display_logic, :skip_logic, :disabled, :template_id

  has_many :comments, serializer: CommentSerializer

  def deleted
    !!object.deleted_at
  end
end
