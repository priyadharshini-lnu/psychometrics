class SubFactorSerializer < ActiveModel::Serializer
  type :factor
  attributes :id, :name
end
