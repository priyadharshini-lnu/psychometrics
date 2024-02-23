# frozen_string_literal: true

module PasswordReset
  extend ActiveSupport::Concern

  included do
    before_action :set_project, only: %i[new create edit update]
  end

  def new
    @form = Users::PasswordResetForm.new
    render 'shared/password_reset'
  end

  def create
    @form = Users::PasswordResetForm.from_params(params[:user])

    if @form.valid?
      project = GetProjectBySubdomain.call!(request.subdomain)
      user = User.find_by(email: @form.email, project: project&.id)
      if user
        resource_class.send_reset_password_instructions(user)
        audit! :request_change_password, user
      end
      set_flash_message! :notice, :send_instructions

      respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
    else
      set_flash_message! :alert, :invalid_email
      redirect_to new_administration_password_path
    end
  end

  private

  def set_project
    @current_project = GetProjectBySubdomain.call!(request.subdomain)
  end
end
