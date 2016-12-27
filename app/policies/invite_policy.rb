class InvitePolicy < BasePolicy
  def new?
    create?
  end

  def create?
    @current_client.retail? && @current_membership.is_retail?
  end
end
