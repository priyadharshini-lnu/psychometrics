# frozen_string_literal: true

module Api
  module V2
    module CommunicationTemplate
      class Schema < Api::Base::Schema
        def self.resource
          'communication_templates'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
            attribute[:kind].filled(:string, included_in?: ::CommunicationTemplate.kinds.keys)
            attribute[:level].filled(:string, included_in?: ::CommunicationTemplate.levels.keys)

            optional(:status).maybe(:string, included_in?: ::CommunicationTemplate.statuses.keys)
            optional(:recipients_default).maybe(:string, included_in?: ::CommunicationTemplate.recipients_defaults.keys)
            optional(:delivery_defaults).maybe(:hash)

            optional(:subject).maybe(:string)
            optional(:body).maybe(:string)

            optional(:created_at).maybe(:string)
            optional(:updated_at).maybe(:string)
          end
        end

        def self.update_translation_request
          json_api_attributes do
            required(:subject).filled(:string)
            required(:body).filled(:string)
            required(:locale).filled(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :client, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :project, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :campaign, resource: :campaigns, relationship: :one, required: false, allowed_blank: true },
            { name: :inherits_from, resource: :communication_templates, relationship: :one,
              required: false, allowed_blank: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
