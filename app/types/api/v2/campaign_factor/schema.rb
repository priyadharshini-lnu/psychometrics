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
            when :update
              update_factor_attributes(attribute)
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
            optional(:ranked).maybe(:bool)
            optional(:min_value).maybe(:integer)
            optional(:max_value).maybe(:integer)
            optional(:is_na_allowed).maybe(:bool)
            optional(:disallow_lead_assessor_moderation).maybe(:bool)
          end
        end

        def self.update_factor_attributes(attribute)
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
            optional(:ranked).maybe(:bool)
            optional(:min_value).maybe(:integer)
            optional(:max_value).maybe(:integer)
            optional(:is_na_allowed).maybe(:bool)
            optional(:disallow_lead_assessor_moderation).maybe(:bool)
          end
        end

        def self.bulk_update
          Dry::Schema.define do
            required(:data).array(:hash) do
              required(:id).filled(:string)
              required(:attributes).hash do
                optional(:code).filled(:string)
                optional(:name).filled(:string)
                optional(:output_type).filled(:string)
                optional(:position).filled(:integer)
                optional(:factor_type).filled(:string, included_in?: ::CampaignFactor.factor_types.keys)
                optional(:public_visibility).filled(:bool)
                optional(:assessment_score_type).maybe(:string,
                                                       included_in?: ::CampaignFactor.assessment_score_types.keys)
                optional(:assessment_id).maybe(:string)
                optional(:factor_id).maybe(:string)
                optional(:description).maybe(:string)
                optional(:ranked).maybe(:bool)
                optional(:formula).maybe(:string)
                optional(:min_value).maybe(:integer)
                optional(:max_value).maybe(:integer)
                optional(:is_na_allowed).maybe(:bool)
                optional(:disallow_lead_assessor_moderation).maybe(:bool)
              end
            end
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
