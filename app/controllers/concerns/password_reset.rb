# frozen_string_literal: true

module PasswordReset
  extend ActiveSupport::Concern

  included do
    before_action :set_project, only: %i[new create]
  end

  def new
    @form = Users::PasswordResetForm.new
    render 'shared/password_reset'
  end

  def create
    @form = Users::PasswordResetForm.from_params(params[:user]).with_context(subdomain: request.subdomain)

    if @form.valid? && successfully_sent?(@form.user)
      resource_class.send_reset_password_instructions(@form.user)
      respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
    else
      render 'shared/password_reset'
    end
  end

  private

  def set_project
    @current_project = GetProjectBySubdomain.call!(request.subdomain)
  end
end
