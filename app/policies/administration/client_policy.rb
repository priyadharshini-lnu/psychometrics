# frozen_string_literal: true

module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:clients, :view)
    end

    def view_licenses?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :view_licenses)
    end

    def copy?
      if record.prime_project?
        record.active? && (@user.is?(:superadmin) || @user.has_grant?(:projects, :manage))
      else
        record.active? && @user.is?(:superadmin)
      end
    end

    def destroy?
      if record.prime_project?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
      else
        @user.is?(:superadmin)
      end
    end

    def edit?
      if record.prime_project?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
      else
        @user.is?(:superadmin)
      end
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
    end

    def new?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
    end

    def manage_campaign?
      return true if @user.is?(:superadmin)
      return true if @user.has_grant?(:campaigns, :manage)

      false
    end

    def create?
      super || @user.has_grant?(:clients, :manage) || @user.has_grant?(:projects, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def sub_campaigns?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def manage_project_admins?
      @user.has_grant?(:projects, :manage_admins)
    end

    def project_admins?
      record.prime_project? && @user.has_grant?(:projects, :manage_admins)
    end

    def search_users?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:client_admin) && @user.client_ids.include?(record.client.id)

      @user.is?(:project_admin) && @user.client_ids.include?(record.id)
    end

    def show?
      true
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
        client_ids = client_ids.nil? ? [] : client_ids
        ancestor_ids = ancestors.nil? ? [] : ancestors.compact.map { |path| path.split('/').map(&:to_i) }.flatten.uniq
        scope.where('id in (?) or ancestry ~ ?', ancestor_ids + client_ids, "(^|\\D)(#{client_ids.join('|')})(/|$)")
      end
    end
  end
end
