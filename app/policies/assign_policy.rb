class AssignPolicy < BasePolicy
  # TODO: Refactoring. Move it to controller
  def update?
    @record.membership_id == @current_membership.id
  end
end
