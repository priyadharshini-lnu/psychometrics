# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end

      def spoof?
        @user.is?(:superadmin)
      end
    end
  end
end
