# frozen_string_literal: true

class SubFactorSerializer < ActiveModel::Serializer
  type :factor
  attributes :id, :name, :description, :icon

  def icon
    object.icon.url
  end
end
