# frozen_string_literal: true

class Threesixty::SubjectPolicy < BasePolicy
  def show?
    @record.user_id == @current_user.id || manager?
  end

  def manager?
    @record.evaluators.joins(:relationship).
      where(evaluator_id: @current_user.id, relationships: { name: 'Manager', type: :global }).
      exists?
  end

  class Scope < Scope
    def resolve
      scope
    end
  end
end
