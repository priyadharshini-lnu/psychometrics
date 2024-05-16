# frozen_string_literal: true

module Users
  class UnlocksController < Devise::UnlocksController
    prepend_before_action :require_no_authentication
    layout 'devise'

    def show
      self.resource = resource_class.unlock_access_by_token(params[:unlock_token])
      yield resource if block_given?

      if resource.errors.empty?
        set_flash_message! :notice, :unlocked
      else
        set_flash_message! :notice, :unprocessable_entity
      end
      url = @current_project ? new_session_path(resource) : root_url

      respond_with_navigational(resource) { redirect_to url }
    end
  end
end
