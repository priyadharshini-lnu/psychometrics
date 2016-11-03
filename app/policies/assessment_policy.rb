class AssessmentPolicy < BasePolicy
  def index?
    true
  end

  def pass?
    @current_membership.assigns.exists?(assessment_id: @record.id)
  end

  class Scope < Scope
    def resolve
      current_membership_id = @user[:current_membership].id
      scope.joins(:assigns).where.has { assigns.membership_id == current_membership_id }.references(:assigns)
    end
  end
end
