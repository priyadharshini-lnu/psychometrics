# frozen_string_literal: true

module Api
  module V2
    module Subject
      class Schema < Api::Base::Schema
        def self.resource
          'workshop_subjects'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:status].filled(:string)
            attribute[:attended].filled(:bool)
          end
        end

        def self.relationships(_)
          [
            { name: :user, resource: :users, relationship: :one }
          ]
        end
      end
    end
  end
end
