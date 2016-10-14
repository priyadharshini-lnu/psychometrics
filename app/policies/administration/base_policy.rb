module Administration
  class BasePolicy
    attr_reader :user, :record

    def initialize(user, record)
      @user = user
      @record = [record].flatten.last
    end

    def index?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def create?
      @user.is?(:superadmin)
    end

    def new?
      create?
    end

    def update?
      @user.is?(:superadmin)
    end

    def edit?
      update?
    end

    def destroy?
      @user.is?(:superadmin)
    end

    def copy?
      @user.is?(:superadmin)
    end

    def toggle_status?
      @user.is?(:superadmin)
    end

    def action?
      edit? || copy? || destroy?
    end

    def scope
      Pundit.policy_scope!(user, record.class)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      # scope - could be array
      # [:administration, Model]
      #
      def resolve
        [scope].flatten.last
      end
    end
  end
end
