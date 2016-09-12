class Administration::QuestionPolicy < Administration::BasePolicy
  def open_channel?
    @user.is?(:superadmin)
  end
end
