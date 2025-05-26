# frozen_string_literal: true

class EndUser::UserIdpSkillsPolicy < BasePolicy
  def index?
    @record == @current_user
  end

  def update?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_can_edit_idp)
  end

  def save_skills?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_can_edit_idp)
  end
end
