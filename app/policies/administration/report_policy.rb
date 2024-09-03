# frozen_string_literal: true

module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      @user.has_grant?(:reports, :view)
    end

    def show?
      has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    def edit
      has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    def create?
      @user.has_grant?(:reports, :manage)
    end

    def update?
      has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    def upload_data_sheet?
      @user.has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    def remap_assessment?
      @user.has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    def open_channel?
      @user.has_permission?(:reports, :manage, project_id: @record.owner_id)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      @user.has_permission?(:reports, :view, project_id: project_id)
    end
  end
end
