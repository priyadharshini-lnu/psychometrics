module Administration
  module Assessments
    class BuilderPolicy < Administration::BasePolicy
      def update?
        @user.is?(:superadmin)
      end
    end
  end
end
