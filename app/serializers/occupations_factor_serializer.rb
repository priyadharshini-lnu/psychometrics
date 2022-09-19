# frozen_string_literal: true

class OccupationsFactorSerializer < ActiveModel::Serializer
  attributes :id, :predicate, :value, :position, :weight

  def id
    object.factor_id
  end
end
