class Administration::QuestionPolicy < Administration::BasePolicy
  def open_channel?
    @user.is?(:superadmin)
  end

  def new_assign?
    @user.is?(:superadmin)
  end

  def assign?
    @user.is?(:superadmin)
  end
end
