module Administration
  class QuestionPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end

    def update?
      @user.is?(:superadmin, :admin)
    end

    def configure?
      update?
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def new_assign?
      @user.is?(:superadmin)
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
