# frozen_string_literal: true

module Api
  module Administration
    module Projects
      class LicensePolicy < BasePolicy
        def index?
          @user.has_permission?(:projects, :manage_licenses,
                                project_id: project_id) || @user.has_permission?(:projects, :view_licenses,
                                                                                 project_id: project_id)
        end

        def create?
          @user.has_permission?(:projects, :manage_licenses, project_id: project_id)
        end

        def update?
          @user.has_permission?(:projects, :manage_licenses, project_id: project_id)
        end
      end
    end
  end
end
