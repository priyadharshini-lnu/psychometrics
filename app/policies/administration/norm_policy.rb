class Administration::NormPolicy < Administration::BasePolicy
  def import?
    create?
  end

  def editor?
    create?
  end

  def export?
    @user.is?(:superadmin)
  end
end
