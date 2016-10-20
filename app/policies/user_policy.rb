class UserPolicy < BasePolicy
  def manager_dashboard?
    @user.is? :manager
  end
end
