# frozen_string_literal: true

module Api
  module V2
    module ReportFamiliesReport
      class Schema < Api::Base::Schema
        def self.resource
          'report_families_reports'
        end

        def self.attributes(_attribute, _)
          proc do
          end
        end

        def self.relationships(_)
          [
            { name: :report, resource: :reports, relationship: :one, required: false, allowed_blank: true },
            { name: :report_family, resource: :report_families, relationship: :one, required: false,
              allowed_blank: true }
          ]
        end
      end
    end
  end
end
