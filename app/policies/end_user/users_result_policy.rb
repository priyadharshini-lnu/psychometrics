# frozen_string_literal: true

class EndUser::UsersResultPolicy < Threesixty::BasePolicy
  def update?
    return false if @record.campaign_user.disabled

    (@record.evaluator_id == @current_user.id) || superadmin?
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
