# frozen_string_literal: true

class Threesixty::UsersResultPolicy < Threesixty::BasePolicy
  def update?
    (!@record.threesixty_subject.evaluation_status_completed? && @record.evaluator_id == @current_user.id) ||
      superadmin?
  end

  def superadmin?
    @current_user.superadmin?
  end

  def upload_media_url?
    update?
  end

  def remove_media?
    update?
  end
end
