# frozen_string_literal: true

module Administration
  module HandoffRedirect
    extend ActiveSupport::Concern

    private

    def redirect_via_handoff(target_user, client, impersonated_by: nil, on_error: nil)
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

      handoff_url = AdminSubdomain.admin_url_for(
        tte,
        path: '/administration/sign_in',
        params: { handoff_token: result[:ok] }
      )

      Utility::Url.redirect_to_safe_internal_url(self, handoff_url, allow_other_host: true)
    end

    def default_handoff_error_redirect
      flash[:alert] = I18n.t('admin.handoff_invalid_token', default: I18n.t('errors.forbidden'))
      redirect_to admin_path
    end
  end
end
