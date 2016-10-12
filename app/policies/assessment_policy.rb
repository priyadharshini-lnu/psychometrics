class AssessmentPolicy < Administration::BasePolicy
  def pass?
    # TODO: add access to end clients
    @user.is?(:superadmin)
  end
end
