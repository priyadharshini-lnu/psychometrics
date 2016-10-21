class AssessmentPolicy < BasePolicy
  def index?
    true
  end

  def pass?
    @current_user.assigns.exists?(assessment_id: @record.id, client_id: @current_client.id)
  end

  class Scope < Scope
    def resolve
      # TODO: use squeel
      scope.includes(:assigns).
          where("assigns.user_id = #{ActiveRecord::Base.sanitize(@user[:current_user].id)} and assigns.client_id = #{ActiveRecord::Base.sanitize(@user[:current_client].id)}").
          references(:assigns)
    end
  end
end
