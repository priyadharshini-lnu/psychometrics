module Api
  module Administration
    class UserPolicy < Api::Administration::BasePolicy
      def show?
        true
      end

      def update?
        false
      end
    end
  end
end
