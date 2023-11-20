# frozen_string_literal: true

module Api
  module V2
    module CampaignFactorGroup
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_factor_groups'
        end
      end
    end
  end
end
