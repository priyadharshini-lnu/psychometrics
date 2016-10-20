class AssessmentPolicy < BasePolicy
  def index?
    true
  end

  def pass?
    @user.assigns.exists?(assessment_id: @record.id, client_id: @client.id)
  end

  class Scope < Scope
    def resolve
      scope.joins(:assigns).where(assigns: { user_id: @user.user.id, client_id: @user.client.id })
    end
  end
end
