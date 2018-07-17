module Administration
  class BulkReportPolicy < Administration::BasePolicy
    def new?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage) || @user.has_grant?(:assigns, :view)
    end

    alias_method :create?, :new?
    alias_method :download?, :new?
  end
end
