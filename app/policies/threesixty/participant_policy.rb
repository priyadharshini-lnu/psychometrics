# frozen_string_literal: true

class Threesixty::ParticipantPolicy < BasePolicy
  def edit?
    return false if @current_user.is_anonym?

    @record.evaluator_id == @current_user.id
  end

  class Scope < Scope
    def resolve
      scope
    end
  end
end
