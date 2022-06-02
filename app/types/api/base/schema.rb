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

      def self.create_relationship_request(name)
        this = self
        relationship = relationships.find { |r| r[:name] == name.to_sym }
        raise 'No such relationship' unless relationship

        has_many = relationship[:relationship] == :many

        define_schema do
          if has_many
            required(:data).array(:hash) do
              instance_eval(&this.resource_identifier)
            end
          else
            required(:data).hash(&this.resource_identifier)
          end
        end
      end

      def self.update_relationship_request(name)
        create_relationship_request(name)
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
          required(:data).value(:array) do
            this.single_resource(:multiple_response)
          end
        end
      end

      def self.define_schema(&block)
        namespace = self.namespace
        Dry::Schema.define do
          config.messages.load_paths += I18n.load_path
          config.messages.namespace = namespace

          instance_eval(&block)
        end
      end

      def self.namespace
        resource
      end

      def self.single_resource(type)
        this = self
        relationship_schema = this.relationship_schema(type)
        Dry::Schema.define do
          instance_eval(&this.resource_identifier)
          instance_eval(&relationship_schema) if relationship_schema

          required(:links).hash do
            required(:self).filled(:string)
          end

          required(:attributes).hash do
            instance_eval(&this.attributes(method(:required), type))
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
            links: %i[single_response multiple_response].include?(type)
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
    end
  end
end
