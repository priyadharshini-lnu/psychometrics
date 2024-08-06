# frozen_string_literal: true

module Api
  module V2
    module ThreesixtyCampaign
      class Schema < Api::Base::Schema
        def self.resource
          'threesixty_campaigns'
        end

        def self.attributes(_attribute, _)
          proc do
            required(:threesixty_type).filled(:string)
            required(:campaign_template_id).filled(:string)
            required(:factors).array(:integer)
            required(:questions).array(:hash) do
              required(:id).filled(:integer)
              required(:selected_choice_indexes).array(:integer)
            end
          end
        end

        def self.single_resource(_type)
          Dry::Schema.define do
            required(:attributes).hash do
              required(:name).filled(:string)
            end
          end
        end

        def self.single_resource_response
          this = self
          Dry::Schema.define do
            required(:data).hash this.single_resource(:single_response)
          end
        end

        def self.create_campaign
          json_api_attributes do
            required(:threesixty_type).filled(:string)
            required(:campaign_template_id).filled(:string)
            required(:factors).array(:integer)
            required(:questions).array(:hash) do
              required(:id).filled(:integer)
              required(:selected_choice_indexes).array(:integer)
            end
          end
        end

        def self.links
          false
        end
      end
    end
  end
end
