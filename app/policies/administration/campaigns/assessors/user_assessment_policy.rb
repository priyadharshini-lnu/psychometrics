# frozen_string_literal: true

module Administration
  module Campaigns
    module Assessors
      class UserAssessmentPolicy < Administration::BasePolicy
        def index?
          @user.is?(:superadmin, :client_admin, :project_admin)
        end

        def bulk_delete?
          index?
        end

        def reset?
          index?
        end
      end
    end
  end
end
