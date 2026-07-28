# frozen_string_literal: true

module Api
  module V2
    module ReportFamily
      class Schema < Api::Base::Schema
        def self.resource
          'report_families'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :assessments, resource: :assessments, relationship: :many, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
