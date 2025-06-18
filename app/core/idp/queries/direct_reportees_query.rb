# frozen_string_literal: true

module Idp
  module Queries
    class DirectReporteesQuery < Rectify::Query
      def initialize(manager_id, project_id)
        @manager_id = manager_id
        @project_id = project_id
      end

      def query
        UserIdpPlan.
          joins('INNER JOIN campaign_users ON campaign_users.user_id = user_idp_plans.user_id').
          joins('INNER JOIN campaigns ON campaigns.id = campaign_users.campaign_id').
          joins('INNER JOIN users ON users.id = user_idp_plans.user_id').
          where(
            campaign_users: { active: true },
            campaigns: { project_id: @project_id },
            user_idp_plans: { active: true },
            users: { manager_id: @manager_id }
          ).
          includes(:user).
          distinct
      end
    end
  end
end
