module Administration
  class LibraryPolicy < Administration::BasePolicy
    def open_channel?
      @user.is?(:superadmin)
    end
  end
end
