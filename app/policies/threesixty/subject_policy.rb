# frozen_string_literal: true

class Threesixty::SubjectPolicy < Threesixty::BasePolicy
  def show?
    @record.user_id == @current_user.id || manager?(@record)
  end
end
