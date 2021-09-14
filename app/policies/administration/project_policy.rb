# frozen_string_literal: true

module Administration
  class ProjectPolicy < Administration::BasePolicy
    def index?
      super || @user.has_permission?(:projects, :view, project_id: project_id)
    end
  end
end
