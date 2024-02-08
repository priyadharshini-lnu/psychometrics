# frozen_string_literal: true

module Api
  module V2
    module CampaignUser
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_users'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:campaign_scores_finalized].maybe(:bool)
            attribute[:campaign_scores_finalized_date].maybe(:string)
            attribute[:campaign_scores_calculated_date].maybe(:string)
          end
        end

        def self.campaign_user_scorings_change_finalize_request
          json_api_attributes do
            required(:finalized).filled(:bool)
          end
        end

        def self.campaign_user_scorings_change_finalize_bulk_request
          json_api_attributes do
            required(:user_ids).array(:string)
            required(:finalized).filled(:bool)
          end
        end

        def self.rescore_bulk_request
          json_api_attributes do
            required(:user_ids).array(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :user, resource: :users, relationship: :one, required: true },
            { name: :campaign_factor_values, resource: :campaign_factor_values, relationship: :many }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
