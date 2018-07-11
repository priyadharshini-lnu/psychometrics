module Administration
  class AssignsReportPolicy < Administration::BasePolicy
    def edit?
      super || @user.has_grant?(:assessments, :assign)
    end

    def update?
      super || @user.has_grant?(:assessments, :assign)
    end
  end
end
