# frozen_string_literal: true

class RelationshipWithUsageSerializer < ActiveModel::Serializer
  attributes :id, :type, :name, :assign_type, :usage

  def usage
    @instance_options[:counters][object.id]&.cache_counter || 0
  end
end
