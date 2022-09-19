# frozen_string_literal: true

module Api
  module V2
    module Dashboard
      class UpdateContract < Api::Base::Contract
        schema Api::V2::Dashboard::Schema.update_request

        rule(data: { attributes: :dataset_id }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enabled) && value.blank?
        end

        rule(data: { attributes: :report_id }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enabled) && value.blank?
        end
      end
    end
  end
end
