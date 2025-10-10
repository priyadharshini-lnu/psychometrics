# frozen_string_literal: true

module Api
  module V2
    module IdpSetting
      class UpdateContract < Api::Base::Contract
        schema Api::V2::IdpSetting::Schema.update_request
      end
    end
  end
end
