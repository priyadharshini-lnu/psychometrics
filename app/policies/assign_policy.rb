class AssignPolicy < BasePolicy
  def update?
    @record.user_id = @user.id
  end
end
