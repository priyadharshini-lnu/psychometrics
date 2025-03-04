# frozen_string_literal: true

class Threesixty::UsersResultPolicy < Threesixty::BasePolicy
  def update?
    (!@record.threesixty_subject.evaluation_status_completed? && @record.evaluator_id == @current_user.id) ||
      superadmin?
  end

  delegate :superadmin?, to: :@current_user

  def upload_media_url?
    update?
  end

  def remove_media?
    update?
  end

  def complete_multipart_upload?
    update?
  end

  def mark_as_user_selected_take?
    update?
  end

  def update_meta_data?
    update?
  end
end
