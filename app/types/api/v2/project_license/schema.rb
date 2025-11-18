# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class Schema < Api::Base::Schema
        def self.resource
          'licenses'
        end

        def self.attributes(attribute, type)
          # byebug
          this = self

          proc do
            optional(:license_id).filled(:string)
            optional(:usage_limit).maybe(:integer)
            optional(:enabled).filled(:bool)

            if this.response_schema?(type)
              attribute[:license_id].filled(:integer)
              attribute[:usage_limit].maybe(:integer)
              attribute[:enabled].filled(:bool)
              attribute[:used_number].filled(:integer)
            end
          end
        end

        def self.relationships(_type)
          [
            { name: :license, resource: :licenses, relationship: :one, required: false },
            { name: :project, resource: :projects, relationship: :one, required: false }
          ]
        end
      end
    end
  end
end
