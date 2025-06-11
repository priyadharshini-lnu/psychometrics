# frozen_string_literal: true

module Idp
  module Queries
    class ManagersWithUnreadCommentsQuery < Rectify::Query
      private_attr_reader :campaign, :recent_timeframe

      def initialize(campaign, recent_timeframe)
        @campaign = campaign
        @recent_timeframe = recent_timeframe
      end

      def query
        User.joins('JOIN users AS managed_users ON managed_users.manager_id = users.id').
          joins('JOIN user_idp_plans ON user_idp_plans.user_id = managed_users.id').
          joins('JOIN user_idp_comments ON user_idp_comments.user_idp_plan_id = user_idp_plans.id').
          where(
            user_idp_plans: { campaign: campaign, active: true },
            user_idp_comments: { created_at: recent_timeframe }
          ).
          where.not('user_idp_comments.created_by_id = users.id').
          where.not('user_idp_comments.read_by_user_ids @> ARRAY[users.id]::integer[]').
          distinct
      end
    end
  end
end
