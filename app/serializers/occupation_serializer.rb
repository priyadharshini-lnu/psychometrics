class OccupationSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :factors

  def factors
    object.occupations_factors.map do |obj|
      OccupationsFactorSerializer.new(obj)
    end
  end
end
