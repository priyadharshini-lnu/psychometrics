# frozen_string_literal: true

module Api
  module V2
    module Client
      class Schema < Api::Base::Schema
        def self.resource
          'clients'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:type].filled(:string, included_in?: ::Client.types.keys)
            attribute[:number].filled(:string)
            attribute[:country].filled(:string)
            attribute[:year].filled(:integer, gteq?: Time.zone.now.year - 2, lteq?: Time.zone.now.year + 10)
            optional(:subdomain).maybe(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :project_manager, resource: :users, relationship: :one }
          ]
        end

        def self.individual_record_meta_schema
          Dry::Schema.define do
            required(:permissions).hash do
              required(:view_licenses).filled(:bool)
              required(:view_audit_reports).filled(:bool)
              required(:view_data_reports).filled(:bool)
            end
          end
        end

        def self.extra_index_meta_schema
          proc do
            optional(:countries).array(:str?)
            optional(:types).array(:str?)
          end
        end
      end
    end
  end
end
