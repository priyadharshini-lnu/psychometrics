class UserPolicy < BasePolicy
  def manager_dashboard?
    @current_user.is? :manager
  end
end
