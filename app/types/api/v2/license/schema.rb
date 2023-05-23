# frozen_string_literal: true

module Api
  module V2
    module License
      class Schema < Api::Base::Schema
        def self.resource
          'licenses'
        end

        def self.attributes(attribute, type)
          this = self
          proc do
            attribute[:type].filled(:string)
            attribute[:start_date].filled(:string)
            attribute[:end_date].filled(:string)
            attribute[:number].filled(:integer)
            attribute[:overuse_number].filled(:integer)

            if this.response_schema?(type)
              attribute[:used_number].filled(:integer)
            end

            optional(:disabled).filled(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :report_family, resource: :report_families, relationship: :one, required: false }
          ]
        end
      end
    end
  end
end
