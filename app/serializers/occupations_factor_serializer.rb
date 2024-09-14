# frozen_string_literal: true

class OccupationsFactorSerializer < Panko::Serializer
  attributes :id, :predicate, :value, :position, :weight

  def id
    object.factor_id
  end
end
