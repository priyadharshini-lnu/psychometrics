# frozen_string_literal: true

module UsersResults
  class FactorSerializer < ActiveModel::Serializer
    attributes :id, :name
  end
end
