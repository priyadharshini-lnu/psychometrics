# frozen_string_literal: true

module Api
  module V2
    module ClientPrivacySettings
      class UpdateContract < Api::Base::Contract
        schema Api::V2::ClientPrivacySettings::Schema.update_request
      end
    end
  end
end
