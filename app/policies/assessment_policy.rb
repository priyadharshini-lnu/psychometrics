class AssessmentPolicy < Administration::BasePolicy
  def pass?
    # TODO: add client_id
    Assign.exists?(user_id: @user.id, assessment_id: record.id)
  end

  class Scope < Scope
    def resolve
      # TODO: add client_id
      scope.joins(:assigns).where(assigns: {user_id: @user.id})
    end
  end
end
