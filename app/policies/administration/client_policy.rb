module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def manage_campaign?
      return true if @user.is?(:superadmin)
      return true if (@user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage))
      false
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

    def client_admins?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && record.client_admins.exists?(@user.id))
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

    def edit_tte?
      @user.is?(:superadmin)
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
        # collect ancestors + self + descendants matching (id | id/* | */id | */id/*) pattern
        clients_scope = @user.is?(:client_admin) ? @user.client_admin_clients : @user.project_admin_clients
        clients = clients_scope.not_retails.select(:id, :ancestry)
        client_ids, ancestors = clients.map { |c| [c.id, c.ancestry] }.transpose
        ancestor_ids = ancestors.compact.map { |path| path.split('/').map(&:to_i) }.flatten.uniq
        scope.where("id in (?) or ancestry ~ ?", ancestor_ids + client_ids, "(^|\\D)(#{client_ids.join('|')})(/|$)")
      end
    end
  end
end
