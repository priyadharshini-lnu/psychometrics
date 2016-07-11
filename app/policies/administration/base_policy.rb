class Administration::BasePolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = current_administrator
    @record = record
  end

  def index?
    @user.superadmin?
  end

  def show?
    scope.where(:id => record.id).exists?
  end

  def create?
    @user.superadmin?
  end

  def new?
    create?
  end

  def update?
    @user.superadmin?
  end

  def edit?
    update?
  end

  def destroy?
    @user.superadmin?
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

    def resolve
      scope
    end
  end
end
