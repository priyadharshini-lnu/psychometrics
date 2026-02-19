# frozen_string_literal: true

module Api
  module V2
    module CampaignIdp
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_idps'
        end

        def self.attributes(_attribute, _type)
          proc do
            optional(:override_exists).maybe(:bool)
            optional(:automatically_assign_new).maybe(:bool)
            optional(:dependencies_attributes).maybe(:hash)
          end
        end

        def self.create_attributes(_attribute)
          proc do
            optional(:override_exists).maybe(:bool)
            optional(:automatically_assign_new).maybe(:bool)
            optional(:dependencies_attributes).maybe(:hash)
          end
        end

        def self.update_attributes(_attribute)
          proc do
            optional(:override_exists).maybe(:bool)
            optional(:automatically_assign_new).maybe(:bool)
            optional(:dependencies_attributes).maybe(:hash)
          end
        end

        def self.relationships(_type)
          [
            { name: :campaign, resource: :campaigns, relationship: :one },
            { name: :idp_template, resource: :idp_templates, relationship: :one }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
