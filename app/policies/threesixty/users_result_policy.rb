# frozen_string_literal: true

class Threesixty::UsersResultPolicy < Threesixty::BasePolicy
  def update?
    @record.evaluator_id == @current_user.id || superadmin?
  end

  def superadmin?
    @current_user.superadmin?
  end
end
