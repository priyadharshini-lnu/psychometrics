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

  def update_reflection_questions?
    @record == @current_user
  end
end
