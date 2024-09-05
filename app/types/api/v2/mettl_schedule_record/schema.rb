# frozen_string_literal: true

module Api
  module V2
    module MettlScheduleRecord
      class Schema < Api::Base::Schema
        def self.resource
          'mettl_schedule_records'
        end

        def self.attributes(_attribute, _)
          proc do
            required(:schedule_name).filled(:string)
            required(:schedule_id).filled(:string)
            required(:created_at).filled(:string)
            required(:assessment_id).filled(:integer)
          end
        end

        def self.create_request
          json_api_attributes do
            required(:assessment_id).filled(:string)
            required(:schedule_name).filled(:string)
            required(:proctoring_enabled).filled(:bool)
            required(:secure_browser_enabled).filled(:bool)
          end
        end

        def self.update_request
          json_api_attributes do
            required(:assessment_id).filled(:integer)
            required(:schedule_name).filled(:string)
            required(:proctoring_enabled).filled(:bool)
            required(:secure_browser_enabled).filled(:bool)
          end
        end
      end
    end
  end
end
