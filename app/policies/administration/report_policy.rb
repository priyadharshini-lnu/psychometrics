module Administration
  class ReportPolicy < Administration::BasePolicy
    def open_channel?
      @user.is?(:superadmin)
    end
  end
end
