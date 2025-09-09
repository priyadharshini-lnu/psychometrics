# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvite
      class UpdateContract < Api::Base::Contract
        config.messages.namespace = :workshop_invite_update

        schema Api::V2::WorkshopInvite::Schema.update_request
      end
    end
  end
end
