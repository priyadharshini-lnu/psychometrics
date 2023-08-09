# frozen_string_literal: true

module Api
  module V2
    module CampaignAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_assessments'
        end

        def self.relationships(_type)
          [{
            name: :assessment, resource: :assessments, relationship: :one
          }]
        end
      end
    end
  end
end
