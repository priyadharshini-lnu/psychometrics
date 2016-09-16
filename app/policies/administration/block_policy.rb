module Administration
  class BlockPolicy < Administration::BasePolicy
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
