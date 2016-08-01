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
  attributes :id, :name, :type, :position, :props, :created_at

end
