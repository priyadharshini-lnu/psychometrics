# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#

class BlockSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :created_at

  has_many :questions, serializer: QuestionSerializer
end
