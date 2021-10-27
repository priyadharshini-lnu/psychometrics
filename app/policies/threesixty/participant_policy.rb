# frozen_string_literal: true

class Threesixty::ParticipantPolicy < Threesixty::BasePolicy
  def approve_evaluation?
    option = @record.campaign.threesixty_option.participants

    option.dig('manager', 'can_approves_evaluations') && manager?(@record.threesixty_subject)
  end

  def index?
    @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
  end

  def show?
    return false unless manage? && !@record.threesixty_subject.evaluation_status_completed?

    option = @record.campaign.threesixty_option.participants
    return false if option.dig('global', 'disable_all_evaluations')
    return true unless option.dig('global', 'can_not_edit_evaluation')

    !@record.result&.completed?
  end

  def edit?
    return false if @current_user.is_anonym? || @record.campaign.closed?

    return false unless show?

    @record.evaluator_id == @current_user.id
  end

  def decline?
    return false if @record.campaign.closed?

    @current_user.id == @record.evaluator_id
  end

  def update_status?
    manager?(@record.threesixty_subject)
  end

  def destroy?
    manage?
  end

  private

  def manage?
    return false if @record.campaign.closed?

    @current_user.id == @record.evaluator_id || manager?(@record.threesixty_subject)
  end
end
