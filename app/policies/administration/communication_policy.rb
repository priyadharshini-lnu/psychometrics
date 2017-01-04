module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def update?
      @user.is?(:superadmin, :admin)
    end

    def new_form?
      true
    end

    def edit_form?
      true
    end

    class Scope < Scope
      def resolve
        collection = [scope].flatten.last
        return collection if @user.is?(:superadmin)
        collection.where(owner_id: [@user.client_ids])
      end
    end
  end
end
