class Administration::UserPolicy < Administration::BasePolicy
  def index?
    @user.can?(:superadmin, :admin)
  end

  def new?
    create?
  end

  def create?
    @user.can?(:superadmin, :admin)
  end

  def edit?
    update?
  end

  def update?
    @user.can?(:superadmin, :admin)
  end

  def toggle_status?
    update?
  end

  def reset_password?
    update?
  end

  def export?
    index?
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return [scope].flatten.last if @user.superadmin?
      # TODO: uncomment it when will be created Client model
      [scope].flatten.last # .where(client_id: @user.client_id)
    end
  end
end
