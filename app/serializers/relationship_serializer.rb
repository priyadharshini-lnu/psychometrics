# frozen_string_literal: true

class RelationshipSerializer < Panko::Serializer
  attributes :id, :type, :name, :assign_type
end
