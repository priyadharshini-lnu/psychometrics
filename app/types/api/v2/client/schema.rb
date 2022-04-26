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
            attribute[:year].filled(:integer, lteq?: Time.zone.now.year)
          end
        end

        def self.relationships(_)
          [
            { name: :account_manager, resource: :users, relationship: :one, allowed_blank: false},
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

# Api::V2::Client::Schema.update_request.call({ data: { type: 'clients', attributes: { name: 'd', type: 'partner', country: 'India', number: '11', year: 2022 }, relationships: { account_manager: { data: { id: 10, type: 'users'} }}, id: 1}})
