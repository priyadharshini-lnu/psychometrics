# frozen_string_literal: true

class Threesixty::ParticipantPolicy < Threesixty::BasePolicy
  def show?
    manage?
  end

  def edit?
    return false if @current_user.is_anonym? || @record.campaign.closed?

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
