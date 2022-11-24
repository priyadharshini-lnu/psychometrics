# frozen_string_literal: true

module Administration
  class QuestionCenterPolicy < Administration::BasePolicy
    def export?
      has_permission?(:questions, :manage)
    end

    def import?
      has_permission?(:questions, :manage)
    end
  end
end
