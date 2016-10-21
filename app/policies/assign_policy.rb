class AssignPolicy < BasePolicy
  def update?
    @record.user_id == @current_user.id
  end
end
