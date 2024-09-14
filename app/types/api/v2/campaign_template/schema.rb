# frozen_string_literal: true

module Api
  module V2
    module CampaignTemplate
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_templates'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
            optional(:created_at).maybe(:string)
            optional(:updated_at).maybe(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :report, resource: :reports, relationship: :one, required: true, allowed_blank: false },
            { name: :assessment, resource: :assessments, relationship: :one, required: true, allowed_blank: false }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
