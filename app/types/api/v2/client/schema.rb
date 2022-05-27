# frozen_string_literal: true

module Api
  module V2
    module Client
      class Schema < Api::Base::Schema
        def self.resource
          'clients'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:type].filled(:string, included_in?: ::Client.types.keys)
            attribute[:number].filled(:string)
            attribute[:country].filled(:string)
            attribute[:year].filled(:integer, gteq?: Time.zone.now.year - 2, lteq?: Time.zone.now.year + 10)
          end
        end

        def self.relationships(_)
          [
            { name: :project_manager, resource: :users, relationship: :one }
          ]
        end

        def self.create_client_admin_request
          Dry::Schema.define do
          end
        end
      end
    end
  end
end
