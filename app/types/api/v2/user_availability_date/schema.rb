# frozen_string_literal: true

module Api
  module V2
    module UserAvailabilityDate
      class Schema < Api::Base::Schema
        TIME_FORMAT = /\A\d{2}:\d{2}\z/
        DATE_FORMAT = /\A\d{4}-\d{2}-\d{2}\z/

        def self.resource
          'user_availability_dates'
        end

        def self.attributes(attribute, type)
          proc do
            attribute[:start_date].filled do
              str? & format?(DATE_FORMAT)
            end
            attribute[:end_date].filled(:string).filled do
              str? & format?(DATE_FORMAT)
            end
            attribute[:timezone].filled(:string)
            if %i[create update].include?(type)
              optional(:availability_days).array(:hash) do
                required(:day).filled(:integer, included_in?: [0, 1, 2, 3, 4, 5, 6])
                required(:start_time).filled do
                  str? & format?(TIME_FORMAT)
                end
                required(:end_time).filled do
                  str? & format?(TIME_FORMAT)
                end
              end
            end
          end
        end

        def self.relationships(_)
          [
            { name: :user_availability_days, resource: :user_availability_days, relationship: :many, required: false }
          ]
        end
      end
    end
  end
end
