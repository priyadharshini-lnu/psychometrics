# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class Schema < Api::Base::Schema
        def self.resource
          'data_reports'
        end

        def self.attributes(_, _)
          proc do
            required(:name).filled(:string)
            required(:configuration).filled(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :owner, resource: :clients, relationship: :one, required: true },
            { name: :last_updated_by, resource: :users, relationship: :one, required: false }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
