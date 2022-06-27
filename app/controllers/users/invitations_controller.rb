# frozen_string_literal: true

module Users
  class InvitationsController < Devise::InvitationsController
    layout 'devise'
    prepend_before_action :sign_out, only: [:edit]
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
  end
end
