class Administration::BasePolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    return true if @user.superadmin?
    false
  end

  def show?
    scope.where(:id => record.id).exists?
  end

  def create?
    return true if @user.superadmin?
    false
  end

  def new?
    create?
  end

  def update?
    return true if @user.superadmin?
    false
  end

  def edit?
    update?
  end

  def destroy?
    return true if @user.superadmin?
    false
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
