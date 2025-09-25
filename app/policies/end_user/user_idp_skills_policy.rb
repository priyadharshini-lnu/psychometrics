# frozen_string_literal: true

class EndUser::UserIdpSkillsPolicy < BasePolicy
  def index?
    @record == @current_user
  end

  def update?
    return false if @current_user_idp.blank?

    if manager_of_record?
      manager_can_edit_plan?
    else
      user_can_edit_own_plan?
    end
  end

  def save_skills?
    return false if @current_user_idp.blank?

    if manager_of_record?
      manager_can_edit_plan?
    else
      user_can_edit_own_plan?
    end
  end

  def toggle_privacy?
    return false if @current_user_idp.blank?

    if manager_of_record?
      manager_can_edit_plan?
    else
      user_can_edit_own_plan?
    end
  end

  def revert_to_public?
    return false if @current_user_idp.blank?

    if manager_of_record?
      manager_can_edit_plan?
    elsif @record == @current_user
      user_can_revert_own_skills?
    else
      false
    end
  end

  private

  def manager_of_record?
    @record.manager == @current_user
  end

  def manager_can_edit_plan?
    @current_project.idp_setting.manager_can_edit_idp && @current_user_idp.manager_editable?
  end

  def user_can_edit_own_plan?
    @current_user_idp.editable? && @record == @current_user
  end

  def user_can_revert_own_skills?
    return false unless @record == @current_user

    if @current_project.idp_setting.manager_approves_idp?
      !@current_user_idp.not_started?
    else
      @current_user_idp.editable?
    end
  end
end
