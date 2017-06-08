module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:clients, :view)
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def create?
      super || @user.has_grant?(:clients, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def sub_campaigns?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def show?
      true
    end

    def edit?
      record.active? && super
    end

    def copy?
      record.active? && super
    end

    def archive?
      edit?
    end

    def design?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :design)
    end

    def export?
      @user.is?(:superadmin)
    end

    def view_additional_fields?
      @user.is?(:superadmin)
    end

    def edit_additional_fields?
      view_additional_fields?
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.full_tree_of(@user.admin_clients.not_retails.enabled.select(:id, :ancestry))
      end
    end
  end
end
