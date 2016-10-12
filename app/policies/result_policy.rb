class ResultPolicy < Administration::BasePolicy
  # TODO: move to another scope
  def update?
    Rails.logger.warn "@record #{@record.inspect}"
    @user.is?(:superadmin)
  end
end
