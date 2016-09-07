class Administration::NormPolicy < Administration::BasePolicy
  def import?
    create?
  end

  def editor?
    create?
  end

  def change_cell?
    create?
  end

  def export?
    @user.is?(:superadmin)
  end
end
