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
            attribute[:position].filled(:integer)
            attribute[:campaign_factor_group_id].filled(:integer)
            attribute[:factor_type].filled(:string)
            attribute[:public_visibility].filled(:bool)
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
