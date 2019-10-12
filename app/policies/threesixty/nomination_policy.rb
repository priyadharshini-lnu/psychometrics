# frozen_string_literal: true

class Threesixty::NominationPolicy < Threesixty::BasePolicy
  def create?
    return true if subject_can_manage_nominations? && @current_user.id == @record.user_id

    manager_can_manage_nominations? && manager?(@record)
  end

  def destroy?
    return true if subject_can_manage_nominations? && @current_user.id == @record.subject_id

    manager_can_manage_nominations? && manager?(@record.threesixty_subject)
  end

  def update_status?
    manager_can_approve_nominations? && manager?(@record.threesixty_subject)
  end

  private

  def manager_can_manage_nominations?
    option.participants.dig('manager', 'can_choose_evaluators')
  end

  def manager_can_approve_nominations?
    option.participants.dig('manager', 'can_approve_nominations')
  end

  def subject_can_manage_nominations?
    option.participants.dig('subject', 'can_nominate_evaluators')
  end

  def option
    @option ||= @record.campaign.threesixty_campaign.option
  end

  def manage?
    @current_user.id == @record.subject_id || manager?(@record.threesixty_subject)
  end
end
