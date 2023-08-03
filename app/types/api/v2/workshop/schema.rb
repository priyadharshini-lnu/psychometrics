# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class Schema < Api::Base::Schema
        def self.resource
          'workshops'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:start_time].filled(:string)
            attribute[:duration].filled(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :managers, resource: :workshop_managers, relationship: :many, required: false },
            { name: :assessors, resource: :workshop_assessors, relationship: :many, required: false }
          ]
        end

        def self.create_all_request
          json_api_attributes do
            required(:workshops).array(:hash) do
              required(:duration).filled(:integer)
              required(:timezone).filled(:string)
              required(:duration).filled(:integer)
              required(:cancellation_lead_time).filled(:integer)
              required(:reschedule_lead_time).filled(:integer)
              required(:video_call_type).filled(:int?, included_in?: [0, 1, 2]) # Adjust the range as needed
              required(:workshop_resources).array(:hash) do
                required(:name).filled(:string)
                required(:url).filled(:string)
              end
              required(:start_time).filled(:string)
              optional(:center_manager_ids).array(:string)
              optional(:assessor_ids).array(:string)
              optional(:meeting_link).maybe(:string)
            end
          end
        end
      end
    end
  end
end
