class Administration::BlockPolicy < Administration::BasePolicy
  def open_channel?
    @user.is?(:superadmin)
  end
end
