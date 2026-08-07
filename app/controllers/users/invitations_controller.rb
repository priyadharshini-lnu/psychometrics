# frozen_string_literal: true

module Users
  class InvitationsController < Devise::InvitationsController
    layout 'devise'
    prepend_before_action :sign_out, only: [:edit]
    prepend_before_action :verify_recaptcha_or_render, only: [:update]
    before_action :check_if_saml_is_enforced, only: [:edit]

    def update
      super
      return unless current_user

      # TODO: Remove membership related code after campaign migration
      membership = current_user.memberships.find_by(client: @current_project)
      (membership || current_user)&.update_columns(already_invited: true)
    end

    private

    def check_if_saml_is_enforced
      redirect_to(new_user_session_path) if @current_project.saml_enforced?
    end

    def verify_recaptcha_or_render
      return if SkipRecaptcha.call!(request)

      @current_project = GetProjectBySubdomain.call!(request.subdomain)
      return unless @current_project&.security_setting&.enable_recaptcha

      unless verify_recaptcha(response: params[:recaptcha_token])
        flash[:alert] = I18n.t('administration.administrator.sessions.errors.recaptcha')
        self.resource = resource_class.new
        resource.invitation_token = params[:user][:invitation_token]
        render :edit
      end
    end
  end
end
