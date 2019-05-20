# frozen_string_literal: true

module Administration
  module Threesixty
    class OptionPolicy < Administration::BasePolicy
      def participant_options?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      def report_options?
        participant_options?
      end
    end
  end
end
