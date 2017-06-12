module Administration
  class MembershipPolicy < Administration::UserPolicy
    CREATE_PARAMETERS = [:first_name, :last_name, :email, :parent_id].freeze
    RECORD_PARAMETERS = [:parent_id, :role, hris_data: [:key, :value]].freeze
    USER_PARAMETERS = [:id, :first_name, :last_name, :email, :disabled, :role].freeze
    GRANT_PARAMETERS = [grants: [
      norms: [:view, :manage],
      dimensions: [:view, :manage],
      clients: [:view, :manage, :design],
      assessments: [:view, :manage, :assign, :export, :import],
      translations: [:export, :import],
      reports: [:view, :manage],
      questions: [:view, :manage],
      libraries: [:view, :manage],
      communications: [:view, :manage],
      projects: [:view, :manage],
      assigns: [:view]
    ]].freeze

    def create?
      @user.is?(:superadmin, :admin)
    end

    def permitted_attributes_for_create
      if @user.is?(:superadmin)
        CREATE_PARAMETERS + [user_attributes: [GRANT_PARAMETERS]]
      else
        CREATE_PARAMETERS
      end
    end

    def permitted_attributes_for_update
      if @user.is?(:superadmin) && @record.user.is?(:admin)
        RECORD_PARAMETERS + [user_attributes: [USER_PARAMETERS, GRANT_PARAMETERS].flatten]
      else
        RECORD_PARAMETERS + [user_attributes: [USER_PARAMETERS]]
      end
    end

    def overview_assigns?
      return true if @user.is? :superadmin
      @user.has_grant?(:assigns, :view)
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
