module Administration
  class AssessmentPolicy < Administration::BasePolicy
    def open_channel?
      @user.is?(:superadmin)
    end

    def show?
      @user.is?(:superadmin)
    end

    def preview?
      @user.is?(:superadmin)
    end

    def reports?
      @user.is?(:superadmin)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope.joins(:clients).where(clients: { id: @user.client_ids })
      end
    end
  end
end
