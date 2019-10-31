# frozen_string_literal: true

class Threesixty::BasePolicy < BasePolicy
  def manager?(subject)
    Threesixty::Subjects::GetManagers.new(subject: subject).query.exists?(user_id: @current_user.id)
  end

  class Scope < Scope
    def resolve
      scope
    end
  end
end
