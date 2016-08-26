class Administration::AssessmentPolicy < Administration::BasePolicy
  def open_channel?
    @user.is?(:superadmin)
  end

  def show?
    @user.is?(:superadmin)
  end

  def preview?
    @user.is?(:superadmin)
  end
end
