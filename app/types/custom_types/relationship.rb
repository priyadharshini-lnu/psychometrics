# frozen_string_literal: true

module CustomTypes
  class Relationship
    def self.relationship_data_type(name, resource = nil)
      type = (resource || name).to_s
      Dry::Schema.define do
        required(:type).filled(:string).value(eql?: type)
        required(:id).filled(:string)
      end
    end

    def self.relationship_type(detail)
      data_type = relationship_data_type(detail[:name], detail[:resource])
      Dry::Schema.define do
        attribute = detail[:required] ? method(:required) : method(:optional)

        attribute[detail[:name]].hash do
          attribute = detail[:required] ? method(:required) : method(:optional)

          data_method = detail[:allowed_blank] ? :maybe : :value
          if detail[:relationship] == :many
            required(:data).public_send(data_method) do
              array do
                hash data_type
              end
            end
          else
            required(:data).public_send(data_method) do
              hash data_type
            end
          end

          if detail[:links]
            attribute[:links].hash do
              attribute[:self].filled(:string)
              attribute[:related].filled(:string)
            end
          end
        end
      end
    end

    def self.relationships(details)
      relationships = Dry::Schema.define
      details.each do |detail|
        relationships = relationships.merge(relationship_type(detail))
      end
      relationships
    end
  end
end
