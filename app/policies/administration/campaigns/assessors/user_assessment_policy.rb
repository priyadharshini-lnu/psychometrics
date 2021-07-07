# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin) || @user.has_permission?(:assessors, :view, project_id)
        end

        def create?
          @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id)
        end

        def bulk_delete?
          @user.is?(:superadmin) || @user.has_permission?(:assessors, :manage, project_id)
        end

        def reset?
          @user.is?(:superadmin) || (@user.has_permission?(:campaigns, :manage_users, project_id) &&
            @user.has_permission?(:assessors, :manage, project_id))
        end
      end
    end
  end
end
