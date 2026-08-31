# frozen_string_literal: true

module Administration
  module HandoffRedirect
    extend ActiveSupport::Concern

    private

    def redirect_via_handoff(target_user, client, impersonated_by: nil, on_error: nil, locale: nil)
      tte = client.root

      result = AdminAuth::GenerateHandoffToken.call(target_user, tte, impersonated_by: impersonated_by)

      if result[:error]
        if on_error
          on_error.call
        else
          default_handoff_error_redirect
        end
        return
      end

      handoff_params = { handoff_token: result[:ok] }
      handoff_params[:locale] = locale if locale.present?
      handoff_url = AdminSubdomain.admin_url_for(
        tte,
        path: '/administration/sign_in',
        params: handoff_params
      )

      Utility::Url.redirect_to_safe_internal_url(self, handoff_url, allow_other_host: true)
    end

    # The shell renders no flash, so the reason travels as a query param the boot code toasts and strips.
    def default_handoff_error_redirect
      redirect_to admin_path(notice: :handoff_failed)
    end
  end
end
