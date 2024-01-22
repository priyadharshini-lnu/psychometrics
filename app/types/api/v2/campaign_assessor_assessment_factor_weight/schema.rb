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

        def self.bulk_upsert
          json_api_attributes do
            required(:data).array(:hash) do
              required(:factor_id).filled(:string)
              required(:assessment_id).filled(:string)
              required(:weight).filled(:float)
            end
          end
        end
      end
    end
  end
end
