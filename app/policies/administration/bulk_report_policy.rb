module Administration
  class BulkReportPolicy < Administration::BasePolicy
    def new?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    alias_method :create?, :new?
    alias_method :download?, :new?
  end
end
