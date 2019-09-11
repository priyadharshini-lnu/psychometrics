# frozen_string_literal: true

class AssessmentPolicy < BasePolicy
  def index?
    return false if @current_user.is_anonym?

    true
  end

  # TODO: Refactoring. Move it to controller
  def pass?
    return false if @current_user.is_anonym?

    @record.assigns.exists?(membership_id: @current_membership.id)
  end

  class Scope < Scope
    def resolve
      current_membership_id = @user[:current_membership].id
      scope.includes(:assigns).where.has { assigns.membership_id == current_membership_id }.references(:assigns)
    end
  end
end
