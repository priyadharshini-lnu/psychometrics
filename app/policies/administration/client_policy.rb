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
        clients = @user.admin_clients.not_retails.enabled
        parent_ids = clients.map { |c| c.client.id }
        if scope.is_a? Client
          return parent_ids.include?(scope.id) ? scope : nil
        else
          scope.where.has { (id.in parent_ids) | (parent_id.in parent_ids) }
        end
      end
    end
  end
end
