# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end
    end
  end
end
