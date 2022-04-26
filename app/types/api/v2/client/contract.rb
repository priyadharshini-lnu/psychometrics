# frozen_string_literal: true

module Api
  module V2
    module Client
      class Contract < Api::Base::Contract
        schema Api::V2::Client::Schema.create_request
      end
    end
  end
end
