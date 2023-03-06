# frozen_string_literal: true

module Api
  module V2
    module Projects
      class UpdateContract < Api::Base::Contract
        schema Api::V2::Projects::Schema.update_request

        rule(data: { attributes: :text }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enable_privacy_link) && value.blank?
        end

        rule(data: { attributes: :link }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enable_privacy_link) && value.blank?
        end
      end
    end
  end
end
