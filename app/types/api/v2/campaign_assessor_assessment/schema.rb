# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessorAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_assessor_assessments'
        end

        def self.attributes(attribute, type)
          case type
            when :update
              update_campaign_assessment_group_attributes(attribute)
            else
              base_attributes(attribute)
          end
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:assessment_id].filled(:string)
          end
        end

        def self.update_campaign_assessment_group_attributes(attribute)
          proc do
            attribute[:campaign_assessment_group_id].maybe(:string)
          end
        end
      end
    end
  end
end
