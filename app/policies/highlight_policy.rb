# frozen_string_literal: true

class HighlightPolicy < BasePolicy
  def update?
    !@record.instance_of?(Highlight) || @record.user_id == @current_user.id
  end
end
