# frozen_string_literal: true

module Administration
  class UserIdpSkillPolicy < Administration::BasePolicy
    def manage?
      user.is?(:superadmin)
    end

    class Scope < BasePolicy::Scope
      def resolve
        scope.public_skills
      end
    end
  end
end
