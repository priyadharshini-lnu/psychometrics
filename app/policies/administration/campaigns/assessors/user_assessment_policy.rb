# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin) || @user.has_permission?(
            :assessors, :view, project_id: project_id, campaign_id: campaign_id
          )
        end

        def create?
          @user.is?(:superadmin) || @user.has_permission?(
            :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
          )
        end

        def bulk_delete?
          has_permission?(:assessors, :manage)
        end

        def reset?
          has_permission?(:results, :reset_responses)
        end

        def rescore?
          has_permission?(:results, :rescore_responses)
        end

        def reset_progress?
          has_permission?(:results, :reset_progress)
        end
      end
    end
  end
end
