# frozen_string_literal: true

module Api
  module V2
    module CampaignFactorGroup
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factor_groups'
        end

        def self.attributes(attribute, type)
          case type
            when :create
              create_attributes(attribute)
            when :update_positions
              update_positions_attributes(attribute)
            else
              base_attributes(attribute)
          end
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:name].filled(:string)
            attribute[:position].filled(:integer)
          end
        end

        def self.create_attributes(attribute)
          proc do
            attribute[:name].filled(:string)
            attribute[:position].filled(:integer)
          end
        end

        def self.update_positions_attributes(attribute)
          proc do
            attribute[:position].filled(:integer)
          end
        end

        def self.relationships(_type)
          [
            { name: :campaign, resource: :campaigns, relationship: :one, required: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
