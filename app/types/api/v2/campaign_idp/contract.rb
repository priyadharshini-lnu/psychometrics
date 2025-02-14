# frozen_string_literal: true

module Api
  module V2
    module CampaignIdp
      class Contract < Api::Base::Contract
        config.messages.namespace = :campaign_idps
        schema Api::V2::CampaignIdp::Schema.create_request
      end
    end
  end
end
