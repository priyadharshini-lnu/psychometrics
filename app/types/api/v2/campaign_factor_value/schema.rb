# frozen_string_literal: true

module Api
  module V2
    module CampaignFactorValue
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factor_values'
        end
      end
    end
  end
end
