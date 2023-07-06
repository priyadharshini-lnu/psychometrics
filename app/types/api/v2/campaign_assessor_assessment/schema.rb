# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessorAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_assessor_assessments'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:assessment_id].filled(:string)
          end
        end
      end
    end
  end
end
