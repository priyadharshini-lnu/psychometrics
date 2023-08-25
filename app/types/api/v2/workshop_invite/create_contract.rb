# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvite
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_invite_create

        schema Api::V2::WorkshopInvite::Schema.create_request
      end
    end
  end
end
