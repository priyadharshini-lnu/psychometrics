# frozen_string_literal: true

module Administration
  module Threesixty
    class OptionPolicy < Administration::BasePolicy
      def participation_options?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end
    end
  end
end
