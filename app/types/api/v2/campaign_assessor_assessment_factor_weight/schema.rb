# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessorAssessmentFactorWeight
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_assessor_assessment_factor_weights'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:weight].filled(:float)
          end
        end

        def self.relationships(_type)
          [
            { name: :assessment, resource: :assessments, relationship: :one },
            { name: :factor, resource: :factor, relationship: :one }
          ]
        end

        def self.bulk_upsert(only_float_weight: false)
          json_api_attributes do
            required(:data).array(:hash) do
              required(:factor_id).filled(:string)
              required(:assessment_id).filled(:string)
              # dry-swagger has issue generating swagger docs when property can have multiple type.
              # Fixing dry-swagger to handle this case if time consuming task.
              # Having weight always as float makes sense, but from javascript we are not able to pass 1.0 as float.
              # It will be passed as integer. So for our frontend we are allowing weight to be either integer or float.
              if only_float_weight
                required(:weight).filled(:float)
              else
                required(:weight) { int? | float? }
              end
            end
          end
        end
      end
    end
  end
end
