module CustomTypes
  class Relationship
    def self.relationship_data_type(name, resource = nil)
      type = (resource || name).to_s
      Types::Hash.schema(
        id: Types::String,
        type: Types.Value(type)
      )
    end

    def self.relationship_type(detail)
      data_type = relationship_data_type(detail[:name], detail[:resource])
      Dry::Schema.define do
        attribute = detail[:required] ? method(:required) : method(:optional)

        attribute[detail[:name]].hash do
          attribute = detail[:required] ? method(:required) : method(:optional)

          data_method = detail[:allowed_blank] ? :maybe : :value
          if detail[:relationship] == :many
            required(:data).public_send(data_method, array[data_type])
          else
            required(:data).public_send(data_method, data_type)
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
      data = details.each do |detail, acc|
        relationships = relationships.merge(relationship_type(detail))
      end
      relationships
    end
  end
end
