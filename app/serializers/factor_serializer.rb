# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  questions_count  :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :string
#  disabled         :boolean          default(FALSE)
#

class FactorSerializer < ActiveModel::Serializer
  attributes :id, :name
  attribute :sub_factors, if: -> { object.root? }

  def sub_factors
    object.sub_factors.map do |sub_factors|
      SubFactorSerializer.new(sub_factors)
    end
  end
end
