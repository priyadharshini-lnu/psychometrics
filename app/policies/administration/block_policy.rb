module Administration
  class BlockPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:questions, :view)
    end

    def create?
      super || @user.has_grant?(:questions, :manage)
    end

    def open_channel?
      @user.is?(:superadmin)
    end

    def new_assign?
      @user.is?(:superadmin)
    end

    def preview?
      @user.is?(:superadmin)
    end
  end
end
