# frozen_string_literal: true

module Api
  module Administration
    class UserReportPolicy < BasePolicy
      def availability_details?
        return true if user.is?(:superadmin)

        has_permission?(
          :results,
          :view_report,
          project_id: record.campaign.project_id,
          campaign_id: record.campaign_id
        ) ||
          has_permission?(
            :campaigns,
            :manage_users,
            project_id: record.campaign.project_id,
            campaign_id: record.campaign_id
          ) ||
          has_permission?(
            :campaigns,
            :view,
            project_id: record.campaign.project_id,
            campaign_id: record.campaign_id
          )
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope.all if user.is?(:superadmin)

          by_results_permission = user.accessible_records(UserReport, 'results.view_report')
          by_manage_users_permission = user.accessible_records(UserReport, 'campaigns.manage_users')
          by_campaign_view_permission = user.accessible_records(UserReport, 'campaigns.view')

          by_results_permission.or(by_manage_users_permission).or(by_campaign_view_permission)
        end
      end
    end
  end
end
