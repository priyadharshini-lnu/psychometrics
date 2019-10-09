# frozen_string_literal: true

class Threesixty::ParticipantPolicy < BasePolicy
  def show?
    return true if @current_user.id == @record.evaluator_id

    Threesixty::Subjects::GetManagers.new(subject: @record.threesixty_subject).query.exists?(user_id: @current_user.id)
  end

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
