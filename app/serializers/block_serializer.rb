class BlockSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :created_at

end