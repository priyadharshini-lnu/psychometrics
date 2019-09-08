# frozen_string_literal: true

module Administration
  class BulkReportPolicy < Administration::BasePolicy
    def new?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage) || @user.has_grant?(:assigns, :view)
    end

    alias create? new?
    alias download? new?
  end
end
