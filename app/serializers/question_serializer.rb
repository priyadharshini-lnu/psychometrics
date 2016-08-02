# == Schema Information
#
# Table name: questions
#
#  id         :integer          not null, primary key
#  name       :string
#  position   :integer
#  type       :string
#  props      :json
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  block_id   :integer
#  deleted_at :datetime
#

class QuestionSerializer < ActiveModel::Serializer
  attributes :id, :name, :type, :position, :props, :deleted, :created_at

  has_many :comments

  def deleted
    !!object.deleted_at
  end

  def props
    JSON.parse(object.props) if object.props
  end
end
