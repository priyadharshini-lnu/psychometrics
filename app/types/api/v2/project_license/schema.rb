# frozen_string_literal: true

module Api
  module V2
    module ProjectLicense
      class Schema < Api::Base::Schema
        def self.resource
          'project_licenses'
        end

        def self.attributes(_attribute, type)
          proc do
            if %i[create update].include?(type)
              optional(:enabled).filled(:bool?)
              optional(:usage_limit).filled(:integer, gteq?: 0)
              optional(:used_number).filled(:integer, gteq?: 0)
            end
          end
        end

        def self.relationships(_type)
          [
            { name: :project, resource: :projects, relationship: :one },
            { name: :license, resource: :licenses, relationship: :one }
          ]
        end
      end
    end
  end
end
