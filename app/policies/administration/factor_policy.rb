class Administration::FactorPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user   = user
    @record = record
  end
end
