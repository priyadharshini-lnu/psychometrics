class AssessmentPolicy < BasePolicy
  def index?
    return false if @current_user.is_anonym?
    true
  end

  def pass?
    return false if @current_user.is_anonym?
    @current_membership.assigns.exists?(assessment_id: @record.id)
  end

  class Scope < Scope
    def resolve
      current_membership_id = @user[:current_membership].id
      scope.includes(:assigns).where.has { assigns.membership_id == current_membership_id }.references(:assigns)
    end
  end
end
