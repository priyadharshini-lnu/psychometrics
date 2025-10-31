# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class LicenseResource < Api::V2::Administration::BaseResource
          model_name 'ProjectLicense'

          attributes :enabled, :usage_limit, :used_number, :license_id, :project_id

          has_one :license
          has_one :project

          def self.records(opts = {})
            opts[:context][:project].project_licenses
          end

          before_create do
            @model.project = context[:project]
          end
        end
      end
    end
  end
end
