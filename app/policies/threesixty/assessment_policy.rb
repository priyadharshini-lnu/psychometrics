# frozen_string_literal: true

class Threesixty::AssessmentPolicy < Threesixty::BasePolicy
  def index?
    return false if @current_user.is_anonym?

    true
  end
end
