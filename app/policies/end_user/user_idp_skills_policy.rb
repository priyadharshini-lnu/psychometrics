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
end
