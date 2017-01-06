module Administration
  module Assessments
    class AssignPolicy < Administration::BasePolicy
      def step1?
        show?
      end

      def not_selected_users?
        show?
      end

      def selected_users?
        show?
      end

      def show?
        super || @user.has_grant?(:assessments, :assign)
      end
    end
  end
end
