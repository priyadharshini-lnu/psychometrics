class SubFactorSerializer < ActiveModel::Serializer
  type :factor
  attributes :id, :name, :description, :icon

  def icon
    object.icon.url(:middle)
  end
end
