# == Schema Information
#
# Table name: assessments
#
#  id           :integer          not null, primary key
#  name         :string
#  category     :enum             default("psychometric")
#  dimension_id :integer
#  disabled     :boolean          default(FALSE)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  flow         :json
#

class AssessmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :disabled, :created_at, :flow

  has_many :blocks, serializer: BlockSerializer
end
