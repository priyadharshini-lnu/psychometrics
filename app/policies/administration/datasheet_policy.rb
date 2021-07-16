# frozen_string_literal: true

module Administration
  class DatasheetPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_permission?(:datasheets, :view, project_id)
    end
  end
end
