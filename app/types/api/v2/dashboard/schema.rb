# frozen_string_literal: true

module Api
  module V2
    module Dashboard
      class Schema < Api::Base::Schema
        def self.resource
          'dashboards'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:dashboard_type].filled(:string, included_in?: ::Dashboard.dashboard_types.keys)
            optional(:project_path).maybe(:string)
            optional(:capacity_id).maybe(:string)
            optional(:dataset_id).maybe(:string)
            optional(:report_id).maybe(:string)
            optional(:enabled).filled(:bool)
            optional(:refresh_interval).maybe(:integer, included_in?: [15, 30, 60, 90])
          end
        end

        def self.relationships(_)
          [
            { name: :campaign, resource: :campaigns, relationship: :one }
          ]
        end
      end
    end
  end
end
