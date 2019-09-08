# frozen_string_literal: true

module DeviseHelper
  def devise_error_messages!
    flash.now[:error] = resource.errors.full_messages[0] if resource.errors.full_messages.any?
    nil
  end
end
