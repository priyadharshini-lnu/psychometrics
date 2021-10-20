# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsRecordPolicy < Administration::BasePolicy
      def create?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end
    end
  end
end
