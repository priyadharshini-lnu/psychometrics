# frozen_string_literal: true

module Administration
  class ReportPolicy < Administration::BasePolicy
    def upload_data_sheet?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id: project_id)
    end

    def open_channel?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id: project_id)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :view, project_id: project_id)
    end
  end
end
