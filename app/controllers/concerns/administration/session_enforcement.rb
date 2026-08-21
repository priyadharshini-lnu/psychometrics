# frozen_string_literal: true

module Administration
  module SessionEnforcement
    extend ActiveSupport::Concern

    private

    def enforce_root_domain_isolation
      return unless AdminSubdomain.client_admin_sso_enabled?
      return unless user_signed_in?
      return if Current.client_admin_context?
      return if root_domain_user?
      return if controller_excluded_from_root_domain_isolation?

      redirect_to administration_client_selection_path
    end

    # The API cannot redirect to client selection, so it refuses the call the HTML shell would have funneled away.
    def enforce_root_domain_api_isolation
      return unless AdminSubdomain.client_admin_sso_enabled?
      return unless user_signed_in?
      return unless Current.super_admin_context?
      return if root_domain_user?

      render json: { errors: [{ title: I18n.t('errors.forbidden'), status: 403 }] }, status: :forbidden
    end

    # Only superadmins and assessors with no client footprint belong on the root domain.
    def root_domain_user?
      current_user.is?(:superadmin) || current_user.root_domain_assessor?
    end

    def enforce_admin_session_validity
      return unless AdminSubdomain.client_admin_sso_enabled?
      return unless user_signed_in? && Current.client_admin_context?

      impersonator_id = session[:impersonated_by_id]
      impersonator = User.find_by(id: impersonator_id) if impersonator_id.present?

      if impersonator_id.present? && impersonator.nil?
        sign_out(current_user)
        redirect_to new_administration_session_url(subdomain: Settings.subdomain), allow_other_host: true
        return
      end

      return if AdminAuth::SessionRegistry.session_active?(current_user, Current.client,
                                                           impersonator: impersonator)

      sign_out(current_user)
      redirect_to new_administration_session_url(subdomain: Settings.subdomain), allow_other_host: true
    end

    def controller_excluded_from_root_domain_isolation?
      is_a?(Administration::Administrator::SessionsController) ||
        is_a?(Administration::Administrator::ClientSelectionController) ||
        (defined?(Administration::Administrator::PasswordsController) &&
          is_a?(Administration::Administrator::PasswordsController))
    end
  end
end
