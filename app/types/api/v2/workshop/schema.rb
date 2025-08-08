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
            attribute[:name].filled(:string)
            attribute[:start_time].filled(:string)
            attribute[:duration].filled(:integer)
            attribute[:total_seats].filled(:integer)
          end
        end

        def self.relationships(_)
          [
            { name: :managers, resource: :workshop_managers, relationship: :many, required: false },
            { name: :assessors, resource: :workshop_assessors, relationship: :many, required: false },
            { name: :campaign, resource: :campaigns, relationship: :one, required: false }
          ]
        end

        def self.bulk_update_subjects
          assessment_data = Dry::Schema.define do
            required(:type).filled(:string)
            required(:assessment_id).filled(:string)
            required(:time).maybe(:string)
          end

          json_api_attributes do
            Dry::Schema.define do
              required(:override_existing).filled(:bool)
              required(:subject_ids).array(:string)
              required(:assessments).array(assessment_data)
            end
          end
        end

        def self.update_request
          json_api_attributes do
            required(:total_seats).filled(:integer)
            optional(:allow_late_cancellation_and_rescheduling).filled(:bool)
            required(:workshop_assessors_ids).array(:string)
            required(:workshop_managers_ids).array(:string)
            optional(:scheduling_lead_time).filled(:integer)
            optional(:cancellation_lead_time).filled(:integer)
            required(:campaign_assessment_group_id).filled(:string)
          end
        end

        def self.change_status_request
          json_api_attributes do
            required(:status).filled(:string)
          end
        end

        def self.create_all_request
          json_api_attributes do
            required(:workshops).array(:hash) do
              required(:duration).filled(:integer)
              required(:timezone).filled(:string)
              required(:duration).filled(:integer)
              optional(:cancellation_lead_time).maybe(:int?)
              optional(:scheduling_lead_time).maybe(:int?)
              required(:video_call_type).filled(:int?, included_in?: [0, 1, 2]) # Adjust the range as needed
              required(:workshop_resources).array(:hash) do
                required(:name).filled(:string)
                required(:url).filled(:string)
              end
              required(:name).filled(:string)
              required(:start_time).filled(:string)
              optional(:allow_late_cancellation_and_rescheduling).maybe(:bool)
              optional(:disable_cancellation_and_rescheduling).maybe(:bool?)
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
