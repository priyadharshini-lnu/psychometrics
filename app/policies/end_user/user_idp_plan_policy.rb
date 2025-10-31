# frozen_string_literal: true

class EndUser::UserIdpPlanPolicy < BasePolicy
  def summary?
    @record == @current_user || @record.manager == @current_user
  end

  def show?
    @record == @current_user || @record.manager == @current_user
  end

  def update?
    @record == @current_user || (@record.manager == @current_user && @current_project.idp_setting.manager_approves_idp)
  end

  def download?
    @record == @current_user || @record.manager == @current_user
  end

  def plan_changes?
    @record == @current_user || @record.manager == @current_user
  end

  def revert_to_last_approved?
    @record == @current_user && (@record.active_user_idp_plan&.draft? || @record.active_user_idp_plan&.rejected?)
  end

  def update_reflection_questions?
    @record == @current_user
  end
end
