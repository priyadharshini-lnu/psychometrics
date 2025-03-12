# frozen_string_literal: true

module Api
  module V1
    module ThreesixtyCampaigns
      class BaseController < Api::V1::BaseController
        before_action :ensure_campaign
        before_action :ensure_threesixty_campaign

        private

        def ensure_threesixty_campaign
          unless @campaign.threesixty?
            raise Api::Errors::InvalidRequest, 'The campaign must be a Threesixty campaign'
          end
        end
      end
    end
  end
end
