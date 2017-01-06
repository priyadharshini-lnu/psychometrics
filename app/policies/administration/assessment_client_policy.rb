module Administration
  class AssessmentClientPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :admin)
    end
  end
end
