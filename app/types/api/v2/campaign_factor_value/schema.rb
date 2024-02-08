# frozen_string_literal: true

module Api
  module V2
    module CampaignFactorValue
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factor_values'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:numeric_value].filled(:float)
          end
        end

        def self.save_assessor_scoring_factor_value_request
          score = Dry::Schema.define do
            required(:campaign_factor_id).filled(:integer)
            required(:score).filled(:float)
          end

          Dry::Schema.define do
            required(:scores).array(score)
            required(:user_id).filled(:integer)
          end
        end

        def self.relationships(_type)
          [
            { name: :campaign, resource: :campaigns, relationship: :one },
            { name: :campaign_factor, resource: :campaign_factor_groups, relationship: :one },
            { name: :user, resource: :user, relationship: :one }
          ]
        end
      end
    end
  end
end
