# frozen_string_literal: true

class RelationshipSerializer < ActiveModel::Serializer
  attributes :id, :type, :name, :assign_type
end
