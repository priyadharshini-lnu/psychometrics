

class InnovationStylesFactorSerializer < ActiveModel::Serializer
  attributes :id, :predicate, :value, :position
  
  def id
    object.factor_id
  end
end
