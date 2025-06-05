# frozen_string_literal: true

module Administration
  class UserIdpSkillPolicy < Administration::BasePolicy
    def manage?
      user.is?(:superadmin)
    end
  end
end
