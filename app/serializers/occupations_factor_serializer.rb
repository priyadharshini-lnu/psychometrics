class OccupationsFactorSerializer < ActiveModel::Serializer
  attributes :id, :predicate, :value

  def id
    object.factor_id
  end
end
