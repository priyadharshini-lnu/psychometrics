# frozen_string_literal: true

module Api
  module Base
    class Schema
      def self.resource
        raise NotImplementedError
      end

      def self.create_request
        this = self
        relationship_schema = this.relationship_schema(:create)
        define_schema do
          required(:data).hash do
            required(:type).filled(Types.Value(this.resource))
            required(:attributes).hash do
              instance_eval(&this.attributes(method(:required), :create))
            end
            instance_eval(&relationship_schema) if relationship_schema
          end
        end
      end

      def self.update_request
        this = self
        relationship_schema = this.relationship_schema(:update)
        define_schema do
          required(:data).hash do
            instance_eval(&this.resource_identifier)
            required(:attributes).hash do
              instance_eval(&this.attributes(method(:optional), :update))
            end
            instance_eval(&relationship_schema) if relationship_schema
          end
        end
      end

      def self.relationship_request(name, type)
        relationships = relationships(type)
        relationships = preprocess_relationships(relationships, type)
        relationship = relationships.find { |r| r[:name] == name.to_sym }
        raise 'No such relationship' unless relationship

        resource_type = Dry::Schema.define do
          required(:type).filled(:string).value(eql?: relationship[:resource].to_s)
          required(:id).filled(:string)
        end
        has_many = relationship[:relationship] == :many
        data_method = relationship[:allowed_blank] ? :maybe : :value
        define_schema do
          if has_many
            required(:data).public_send(data_method) do
              array do
                hash resource_type
              end
            end
          else
            required(:data).public_send(data_method) do
              hash resource_type
            end
          end
        end
      end

      def self.create_relationship_request(name)
        relationship_request(name, :create_relationship)
      end

      def self.update_relationship_request(name)
        relationship_request(name, :update_relationship)
      end

      def self.single_resource_response
        this = self
        Dry::Schema.define do
          required(:data).hash this.single_resource(:single_response)
        end
      end

      def self.multiple_resource_response
        this = self
        Dry::Schema.define do
          required(:data).array do
            this.single_resource(:multiple_response)
          end
          required(:meta).value(this.index_meta_schema) if this.meta?
        end
      end

      def self.define_schema(&)
        namespace = self.namespace
        Dry::Schema.define do
          config.messages.load_paths += I18n.load_path.filter { |file| file.match(/\.yml$/) }
          config.messages.namespace = namespace

          instance_eval(&)
        end
      end

      def self.namespace
        resource
      end

      def self.single_resource(type)
        this = self
        relationship_schema = this.relationship_schema(type)
        Dry::Schema.define do
          config.validate_keys = true
          instance_eval(&this.resource_identifier)
          instance_eval(&relationship_schema) if relationship_schema

          if this.links?
            required(:links).hash do
              required(:self).filled(:string)
            end
          end

          required(:attributes).hash do
            instance_eval(&this.attributes(method(:required), type))
          end

          if this.respond_to?(:individual_record_meta_schema) && this.meta?
            required(:meta).value(this.individual_record_meta_schema)
          end
        end
      end

      def self.resource_identifier
        resource = self.resource
        proc do
          required(:id).filled(:string)
          required(:type).filled(Types.Value(resource))
        end
      end

      def self.preprocess_relationships(relationships, type)
        relationships.each_with_object([]) do |relationship, acc|
          processed_relationship = {
            required: type == :create && relationship[:relationship] == :one,
            allowed_blank: relationship[:relationship] != :one,
            links: links? && %i[single_response multiple_response].include?(type)
          }.merge(relationship)

          acc << processed_relationship
        end
      end

      def self.relationship_schema(type)
        relationships = self.relationships(type)
        relationships = preprocess_relationships(relationships, type)
        return if relationships.blank?

        required = relationships.any? { |r| r[:required] }
        method = required ? :required : :optional

        proc do
          send(method, :relationships).value(
            CustomTypes::Relationship.relationships(relationships)
          )
        end
      end

      def self.index_meta_schema
        this = self
        Dry::Schema.define do
          required(:record_count).filled(:integer)
          required(:page_count).filled(:integer)
          instance_eval(&this.extra_index_meta_schema) if this.respond_to?(:extra_index_meta_schema)
        end
      end

      def self.relationships(_)
        []
      end

      def self.response_schema?(type)
        %i[single_response multiple_response].include?(type)
      end

      def self.json_api_attributes(&)
        Dry::Schema.define do
          required(:data).hash do
            required(:attributes).hash do
              instance_eval(&)
            end
          end
        end
      end

      def self.attributes(_attribute, _type)
        proc {}
      end

      def self.links?
        true
      end

      def self.meta?
        true
      end
    end
  end
end
