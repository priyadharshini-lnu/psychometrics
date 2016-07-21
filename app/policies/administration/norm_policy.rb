class Administration::NormPolicy < Administration::BasePolicy
  def import?
    create?
  end
end
