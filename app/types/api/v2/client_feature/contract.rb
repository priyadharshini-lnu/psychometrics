# frozen_string_literal: true

module Api
  module V2
    module ClientFeature
      class Contract < Api::Base::Contract
        schema Api::V2::ClientFeature::Schema.update_request
      end
    end
  end
end
