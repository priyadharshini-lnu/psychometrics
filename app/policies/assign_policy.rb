# frozen_string_literal: true

class AssignPolicy < BasePolicy
  def pass?
    return false if @current_user.is_anonym?

    @record.membership_id == @current_membership.id
  end

  def show?
    pass?
  end

  def events?
    pass?
  end

  def set_language?
    pass?
  end

  def assessment?
    pass?
  end

  def results?
    pass?
  end

  def index?
    return false if @current_user.is_anonym?

    true
  end

  def accept_privacy?
    index?
  end

  def update?
    @record.membership_id == @current_membership.id
  end

  def upload_media_url?
    update?
  end

  def upload_callback?
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

  def redirect?
    index?
  end

  class Scope < Scope
    def resolve
      scope.
        where(membership_id: @user[:current_membership].id).
        joins(:assessment).
        where.not(assessments: { disabled: true })
    end
  end
end
