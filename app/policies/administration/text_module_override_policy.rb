# frozen_string_literal: true

module Administration
  class TextModuleOverridePolicy < Administration::BasePolicy
    def create?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :edit_report, project_id: project_id, campaign_id: campaign_id
      )
    end

    def update?
      @user.is?(:superadmin) || @user.has_permission?(
        :results, :edit_report, project_id: project_id, campaign_id: campaign_id
      )
    end

    def approve?
      @user.is?(:superadmin) || @user.is?(:client_admin) || @user.is?(:project_admin)
    end
  end
end
