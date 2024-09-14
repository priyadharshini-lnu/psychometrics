# frozen_string_literal: true

module Api
  class V2::Administration::Campaigns::SmsHistoriesController < Api::V2::Administration::BaseController
    def policy_class
      @policy_class ||= Api::Administration::Campaigns::SmsHistoryPolicy
    end
  end
end
