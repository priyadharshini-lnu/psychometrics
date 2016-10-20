class UserPolicy < Administration::BasePolicy
  def initialize(context, record)
    @user   = context.user
    @client = context.client
    @record = record
  end

  def manager_dashboard?
    @user.is? :manager
  end
end
