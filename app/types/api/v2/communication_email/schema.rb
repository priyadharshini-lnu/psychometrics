# frozen_string_literal: true

module Api
  module V2
    module CommunicationEmail
      class Schema < Api::Base::Schema
        def self.resource
          'communication_emails'
        end

        def self.attributes(_attribute, _type)
          proc do
            optional(:sent_at).maybe(:string)
            optional(:created_at).maybe(:string)
            optional(:recipient_name).maybe(:string)
            optional(:recipient_email).maybe(:string)
            optional(:subject).maybe(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :communication_delivery, resource: :communication_deliveries, relationship: :one }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
