# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end

      def reset_password?
        update? && !@record.is_anonym?
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def extend_time?
        index?
      end
    end
  end
end
