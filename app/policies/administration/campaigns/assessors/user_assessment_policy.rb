# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :view, @project_id)
        end

        def create?
          @user.is?(:superadmin) || @user.has_client_grant?(:campaigns, :manage_users, @project_id)
        end

        def bulk_delete?
          @user.is?(:superadmin) || @user.has_client_grant?(:assessors, :manage, @project_id)
        end

        def reset?
          @user.is?(:superadmin) || (@user.has_client_grant?(:campaigns, :manage_users, @project_id) &&
            @user.has_client_grant?(:assessors, :manage, @project_id))
        end
      end
    end
  end
end
