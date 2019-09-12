# frozen_string_literal: true

class PasswordsController < Devise::PasswordsController
  layout 'devise'

  protected

  def after_sign_in_path_for(resource)
    signed_in_root_path(resource)
  end
end
