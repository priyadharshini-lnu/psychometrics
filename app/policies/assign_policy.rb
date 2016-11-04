class AssignPolicy < BasePolicy
  def update?
    @record.membership_id == @current_membership.id
  end
end
