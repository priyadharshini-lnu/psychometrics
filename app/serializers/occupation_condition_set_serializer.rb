# frozen_string_literal: true

class OccupationConditionSetSerializer < Panko::Serializer
  attributes :id, :name, :created_at, :updated_at

  has_many :occupations_factors, serializer: OccupationsFactorSerializer
end
