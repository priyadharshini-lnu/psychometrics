# frozen_string_literal: true

module Api
  module V2
    module PrivacySettings
      class UpdateContract < Api::Base::Contract
        schema Api::V2::PrivacySettings::Schema.update_request

        rule(data: { attributes: :privacy_link_text }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enable_privacy_link) && value.blank?
        end
        rule(data: { attributes: :privacy_link_url }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :privacy_link_url) && value.blank?
        end
        rule(data: { attributes: :privacy_link_url }).validate(http_url_format: { allow_blank: false })
      end
    end
  end
end
