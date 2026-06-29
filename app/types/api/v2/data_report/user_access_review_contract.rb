# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class UserAccessReviewContract < Api::V2::DataReport::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          key.failure(:included_in?, list: ['user_access_review']) unless value == 'user_access_review'
        end

        rule(data: { attributes: :scope }) do
          next unless value

          key.failure(:included_in?, list: ['global']) unless value == 'global'
        end

        rule(data: :relationships) do
          owner_data = values.dig(:data, :relationships, :owner, :data)
          next if owner_data.blank?

          key.failure('owner must be empty for user_access_review')
        end
      end
    end
  end
end
