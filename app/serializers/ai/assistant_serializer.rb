# frozen_string_literal: true

module AI
  class AssistantSerializer < Panko::Serializer
    attributes :id, :name, :description

    has_many :assistant_output_schema_keys,
             serializer: AssistantOutputSchemaKeySerializer
  end
end
