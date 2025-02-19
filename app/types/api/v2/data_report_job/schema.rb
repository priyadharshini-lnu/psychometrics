# frozen_string_literal: true

module Api
  module V2
    module DataReportJob
      class Schema < Api::Base::Schema
        def self.resource
          'data_report_jobs'
        end

        def self.password_response
          Dry::Schema.define do
            required(:password).filled(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :created_by, resource: :users, relationship: :one, required: false }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
