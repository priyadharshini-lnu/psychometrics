# frozen_string_literal: true

module Api
  module V2
    module CampaignFactor
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factors'
        end
      end
    end
  end
end
