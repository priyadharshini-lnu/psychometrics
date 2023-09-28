# frozen_string_literal: true

module Api
  module V2
    module Webhook
      class Contract < Api::Base::Contract
        rule(data: { attributes: :url }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :url }).validate(http_url_format: { allow_blank: true })
      end
    end
  end
end
