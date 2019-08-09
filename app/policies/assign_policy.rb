class AssignPolicy < BasePolicy
  def pass?
    return false if @current_user.is_anonym?
    @record.membership_id == @current_membership.id
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
    @record.membership_id == @current_membership.id
  end

  def upload_media_dev?
    @record.membership_id == @current_membership.id
  end

  def upload_callback?
    @record.membership_id == @current_membership.id
  end

  def remove_media?
    @record.membership_id == @current_membership.id
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
