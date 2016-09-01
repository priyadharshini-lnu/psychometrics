class SubFactorSerializer < ActiveModel::Serializer
  type :factor
  attributes :id, :name, :scoring

  def initialize(object, assessment_id)
    super(object)
    @assessment_id = assessment_id
  end

  def scoring
    object.factors_scoring.where(assessment_id: @assessment_id).map do |scoring|
      FactorsScoringSerializer.new(scoring)
    end
  end
end
