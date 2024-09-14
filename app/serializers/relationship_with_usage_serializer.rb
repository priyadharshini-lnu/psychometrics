# frozen_string_literal: true

class RelationshipWithUsageSerializer < Panko::Serializer
  attributes :id, :type, :name, :assign_type, :usage

  def usage
    context[:counters][object.id]&.cache_counter || 0
  end
end
