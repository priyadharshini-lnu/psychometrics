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

  def redirect?
    index?
  end

  class Scope < Scope
    def resolve
      scope.
        where(membership_id: @user[:current_membership].id).
        joins(:assessment).
        where.has { |assign| assign.assessment.disabled.not_eq(true) }
    end
  end
end
