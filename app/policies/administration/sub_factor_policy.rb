class Administration::SubFactorPolicy < Administration::BasePolicy
  def initialize(user, record)
    @user   = user
    @record = record
  end
end
