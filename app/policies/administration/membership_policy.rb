module Administration
  class MembershipPolicy < Administration::UserPolicy
    CREATE_PARAMETERS = [:parent_id, :role].freeze
    UPDATE_PARAMETERS = [:parent_id, :role, hris_data: [:key, :value]].freeze
    USER_PARAMETERS = [:first_name, :last_name, :email].freeze
    UPDATE_USER_PARAMETERS = [:id, USER_PARAMETERS].flatten.freeze
    GRANT_PARAMETERS = [grants: [
        norms: [],
        dimensions: [],
        clients: [],
        assessments: [],
        translations: [],
        reports: [],
        questions: [],
        libraries: [],
        communications: [],
        projects: [],
        assigns: []
    ]].freeze

    def create?
      @user.is?(:superadmin, :admin)
    end

    def admins?
      @user.is?(:superadmin, :admin)
    end

    def permitted_attributes_for_create
      if @user.is?(:superadmin)
        CREATE_PARAMETERS + [user_attributes: [USER_PARAMETERS, GRANT_PARAMETERS].flatten]
      else
        CREATE_PARAMETERS + [user_attributes: [USER_PARAMETERS, GRANT_PARAMETERS].flatten]
      end
    end

    def permitted_attributes_for_update
      if @user.is?(:superadmin) && @record.user.is?(:admin)
        UPDATE_PARAMETERS + [user_attributes: [UPDATE_USER_PARAMETERS, GRANT_PARAMETERS].flatten]
      else
        UPDATE_PARAMETERS + [user_attributes: [UPDATE_USER_PARAMETERS]]
      end
    end

    def overview_assigns?
      return false if record.scope == :administration
      @user.is?(:superadmin) || @user.has_grant?(:assigns, :view)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        # find memberships for clients with 'admin' role and it's subclients
        client_ids = @user.admin_clients.not_retails.enabled.pluck(:id)
        descedant_ids = Client.where('clients.ancestry ~ ?', "/(#{client_ids.join('|')})(/|$)").pluck(:id)
        scope.where(client_id: client_ids + descedant_ids)
      end
    end
  end
end
