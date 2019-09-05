

class InnovationStylesFactorSerializer < ActiveModel::Serializer
  attributes :id, :predicate, :value, :position, :weight
  
  def id
    object.factor_id
  end
end
