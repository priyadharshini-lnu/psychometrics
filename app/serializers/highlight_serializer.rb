# frozen_string_literal: true

class HighlightSerializer < Panko::Serializer
  attributes :id, :resource_id, :resource_type, :data
end
