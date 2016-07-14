class Administration::UserPolicy < Administration::BasePolicy
  def index?
    return true if @user.admin?
    super
  end

  def edit?
    return true if @user.superadmin?
    return true if @user.admin?
    @record == @user
  end

  def update?
    return true if @user.superadmin?
    return true if @user.admin?
    @record == @user
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return [scope].flatten.last if @user.superadmin?
      # TODO uncommit it when will be created Client model
      [scope].flatten.last# .where(client_id: @user.client_id)
    end
  end
end
