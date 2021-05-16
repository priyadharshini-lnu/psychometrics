# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin) || @user.has_grant?(:assessors, :view)
        end

        def create?
          @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_users)
        end

        def bulk_delete?
          @user.is?(:superadmin) || @user.has_grant?(:assessors, :manage)
        end

        def reset?
          @user.is?(:superadmin) || (@user.has_grant?(:campaigns, :manage_users) &&
            @user.has_grant?(:assessors, :manage))
        end
      end
    end
  end
end
