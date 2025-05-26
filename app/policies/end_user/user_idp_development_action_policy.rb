# frozen_string_literal: true

class EndUser::UserIdpDevelopmentActionPolicy < BasePolicy
  def index?
    @record == @current_user || @record.manager == @current_user
  end

  def user_idp_skills?
    @record == @current_user || @record.manager == @current_user
  end

  def available_development_actions?
    @record == @current_user || @record.manager == @current_user
  end

  def save_plan?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_can_edit_idp)
  end

  def update_progress?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_can_edit_idp)
  end

  def generate_by_ai?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_can_edit_idp)
  end
end
