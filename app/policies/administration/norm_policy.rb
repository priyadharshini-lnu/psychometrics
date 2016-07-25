class Administration::NormPolicy < Administration::BasePolicy
  def import?
    create?
  end
  def inplace?
    create?
  end
end
