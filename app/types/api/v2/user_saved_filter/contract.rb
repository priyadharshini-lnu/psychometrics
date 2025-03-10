# frozen_string_literal: true

module Api
  module V2
    module UserSavedFilter
      class Contract < Api::Base::Contract
        config.messages.namespace = :user_saved_filters

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :resource_type }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :filter_params }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(:data) do
          user = _context[:current_user]
          resource_type = values.dig(:data, :attributes, :resource_type)
          existing_filters_count = ::UserSavedFilter.where(user: user, resource_type: resource_type).count

          if existing_filters_count >= ::UserSavedFilter::MAX_FILTERS_COUNT_PER_RESOURCE_TYPE
            key(:data).failure(:limit_exceeded, limit: ::UserSavedFilter::MAX_FILTERS_COUNT_PER_RESOURCE_TYPE)
          end
        end

        rule(data: { attributes: :name }) do
          user = _context[:current_user]
          name = values.dig(:data, :attributes, :name)
          resource_type = values.dig(:data, :attributes, :resource_type)

          if name && resource_type
            existing_filter = ::UserSavedFilter.find_by(
              user: user,
              name: name,
              resource_type: resource_type
            )

            if existing_filter
              key.failure(:unique_name)
            end
          end
        end
      end
    end
  end
end
