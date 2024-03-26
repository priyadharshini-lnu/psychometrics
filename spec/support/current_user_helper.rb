# frozen_string_literal: true

module CurrentUserHelper
  def set_current_user(user)
    allow(Current).to receive(:user).and_return(user)
  end
end
