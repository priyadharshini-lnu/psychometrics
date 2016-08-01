# == Schema Information
#
# Table name: assessments
#
#  id         :integer          not null, primary key
#  name       :string
#  category   :enum             default("psychometric")
#  norm_id    :integer
#  disabled   :boolean          default(FALSE)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class AssessmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :disabled, :created_at

  has_many :blocks, serializer: BlockSerializer
end
