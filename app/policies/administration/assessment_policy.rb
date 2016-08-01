class Administration::AssessmentPolicy < Administration::BasePolicy
  def open_channel?
    @user.is?(:superadmin)
  end
end
