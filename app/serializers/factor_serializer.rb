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
  attributes :id, :name, :scoring
  attribute :sub_factors, if: -> { object.root? }

  def initialize(object, assessment_id)
    super(object)
    @assessment_id = assessment_id
  end

  def scoring
    object.factors_scoring.where(assessment_id: @assessment_id).map do |scoring|
      FactorsScoringSerializer.new(scoring)
    end
  end

  def sub_factors
    object.sub_factors.map do |sub_factors|
      SubFactorSerializer.new(sub_factors, @assessment_id)
    end
  end
end
