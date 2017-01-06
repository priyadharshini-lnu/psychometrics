module Administration
  class MembershipPolicy < Administration::UserPolicy
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
      assigns: [:view]
    ]].freeze

    def permitted_attributes_for_update
      # SuperAdmin can assign grants only to Admin user
      if @user.is?(:superadmin) && @record.user.is?(:admin)
        RECORD_PARAMETERS + [user_attributes: [USER_PARAMETERS, GRANT_PARAMETERS].flatten]
      else
        RECORD_PARAMETERS + [user_attributes: [USER_PARAMETERS]]
      end
    end

    def overview_assigns?
      @user.has_grant?(:assigns, :view)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.where(client_id: @user.admin_client_ids)
      end
    end
  end
end
