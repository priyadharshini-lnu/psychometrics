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
      if record.project? || record.campaign? || record.sub_campaign?
        record.active? && (@user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id))
      else
        record.active? && @user.is?(:superadmin)
      end
    end

    def destroy?
      if record.project? || record.campaign? || record.sub_campaign?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id)
      else
        @user.is?(:superadmin)
      end
    end

    def edit?
      if record.project? || record.campaign? || record.sub_campaign?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id)
      else
        @user.is?(:superadmin)
      end
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id)
    end

    def new?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
    end

    def manage_campaign?
      return true if @user.is?(:superadmin)
      return true if @user.has_permission?(:campaigns, :manage, project_id)

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
      @user.has_permission?(:projects, :manage_admins, project_id)
    end

    def project_admins?
      record.prime_project? && @user.has_permission?(:projects, :manage_admins, project_id)
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
      @user.is?(:superadmin) || @user.has_permission?(:clients, :design, project_id)
    end

    def export?
      @user.is?(:superadmin)
    end

    def view_additional_fields?
      @user.is?(:superadmin)
    end

    def edit_additional_fields?
      @user.is?(:superadmin)
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)

        # collect ancestors + self + descendants matching (id | id/* | */id | */id/*) pattern
        permission = @user.is?(:client_admin) ? :clients : :projects
        clients_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids

        permitted_clients_ids = clients_ids.select { |client_id| @user.has_permission?(permission, :view, client_id) }

        clients_scope = scope.where(id: permitted_clients_ids)
        clients = clients_scope.not_retails.select(:id, :ancestry)
        client_ids, ancestors = clients.map { |c| [c.id, c.ancestry] }.transpose
        client_ids = client_ids.nil? ? [] : client_ids
        ancestor_ids = ancestors.nil? ? [] : ancestors.compact.map { |path| path.split('/').map(&:to_i) }.flatten.uniq
        scope.where('id in (?) or ancestry ~ ?', ancestor_ids + client_ids, "(^|\\D)(#{client_ids.join('|')})(/|$)")
      end
    end
  end
end
