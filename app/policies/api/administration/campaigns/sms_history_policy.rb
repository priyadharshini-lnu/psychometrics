# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class SmsHistoryPolicy < ::Administration::BasePolicy
        def index?
          @user.is?(:superadmin) || has_permission?(:sms_histories, :view)
        end
      end
    end
  end
end
