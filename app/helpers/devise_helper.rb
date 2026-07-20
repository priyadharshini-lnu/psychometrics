# frozen_string_literal: true

module DeviseHelper
  def devise_error_messages!
    flash.now[:error] = resource.errors.full_messages[0] if resource.errors.full_messages.any?
    nil
  end

  def login_page_project_config
    fallback_background = image_url(randomized_background_image)
    return { background: fallback_background } unless Current.client_admin_context?

    Auth::ClientConfigSerializer.new(context: { background: fallback_background }).serialize(Current.client)
  end
end
