# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class StatusFilterForm
        include ActiveModel::Model

        attr_accessor :statuses

        validate :validate_status_values

        private

        def validate_status_values
          return if statuses.blank?

          invalid_statuses = statuses - Campaign.statuses.keys
          if invalid_statuses.any?
            errors.add(
              :status,
              "The following status parameters are invalid: #{invalid_statuses.join(', ')}. " \
              "Valid statuses are: #{Campaign.statuses.keys.join(', ')}"
            )
          end
        end
      end
    end
  end
end
