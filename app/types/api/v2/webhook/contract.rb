# frozen_string_literal: true

module Api
  module V2
    module Webhook
      class Contract < Api::Base::Contract
        schema Api::V2::Webhook::Schema.create_request

        rule(data: { attributes: :url }).validate(http_url_format: { allow_blank: false })
      end
    end
  end
end
