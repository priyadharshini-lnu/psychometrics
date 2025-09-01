# frozen_string_literal: true

module AI
  class AssistantOutputSchemaKeySerializer < Panko::Serializer
    attributes :id, :key, :description, :key_type
  end
end
