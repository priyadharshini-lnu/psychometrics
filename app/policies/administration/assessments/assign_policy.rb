module Administration
  module Assessments
    class AssignPolicy < Administration::BasePolicy
      def new?
        @user.is?(:superadmin, :admin)
      end

      def step1?
        new?
      end

      def step2?
        new?
      end

      def form?
        new?
      end

      def finish?
        new?
      end

      def create?
        new?
      end

      def users?
        new?
      end

      def not_selected_users?
        new?
      end

      def selected_users?
        new?
      end

      def show?
        super || @user.has_grant?(:assessments, :assign)
      end
    end
  end
end
