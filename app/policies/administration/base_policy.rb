class Administration::BasePolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    @user.can?(:superadmin)
  end

  def show?
    scope.where(:id => record.id).exists?
  end

  def create?
    @user.can?(:superadmin)
  end

  def new?
    create?
  end

  def update?
    @user.can?(:superadmin)
  end

  def edit?
    update?
  end

  def destroy?
    @user.can?(:superadmin)
  end

  def copy?
    @user.can?(:superadmin)
  end

  def toggle_status?
    @user.can?(:superadmin)
  end

  def scope
    Pundit.policy_scope!(user, record.class)
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    # scope - could be array
    # [:administration, Model]
    #
    def resolve
      [scope].flatten.last
    end
  end
end
