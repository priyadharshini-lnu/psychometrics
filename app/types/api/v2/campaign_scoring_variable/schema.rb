# frozen_string_literal: true

module Api
  module V2
    module CampaignScoringVariable
      class Schema < Api::Base::Schema
        def self.resource
          'campaign_scoring_variables'
        end

        def self.attributes(_, _)
          proc do
            optional(:variables).maybe(:string)
          end
        end

        def self.meta?
          false
        end

        def self.links?
          false
        end
      end
    end
  end
end
