# frozen_string_literal: true

module Api
  module V2
    module CampaignFactor
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factors'
        end

        def self.attributes(attribute, type)
          case type
            when :create
              create_attributes(attribute)
            else
              base_attributes(attribute)
          end
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:position].filled(:integer)
          end
        end

        def self.create_attributes(attribute)
          proc do
            attribute[:code].filled(:string)
            attribute[:name].filled(:string)
            attribute[:output_type].filled(:string)
            attribute[:position].filled(:integer)
            attribute[:factor_type].filled(:string, included_in?: ::CampaignFactor.factor_types.keys)
            attribute[:public_visibility].filled(:bool)

            optional(:assessment_score_type).maybe(:string, included_in?: ::CampaignFactor.assessment_score_types.keys)
            optional(:assessment_id).maybe(:string)
            optional(:factor_id).maybe(:string)
            optional(:description).maybe(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :campaign, resource: :campaigns, relationship: :one, required: true },
            { name: :campaign_factor_group, resource: :campaign_factor_groups, relationship: :one }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
