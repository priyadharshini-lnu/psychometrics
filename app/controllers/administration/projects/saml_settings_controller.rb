# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def create
        form = SamlSettings::Form.from_params(resource_params)
        if form.valid?
          project.create_saml_setting(test_settings: form.attributes)
          render json: project.saml_setting, serializer: ::Administration::Projects::SamlSettingSerializer,
                 requires_verification: true
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = SamlSettings::Form.from_params(resource_params)
        if form.valid?
          requires_verification = !Utility::Hash.match?(
            form.attributes,
            project.saml_setting.attributes.symbolize_keys,
            %i[entity_id sso_service_url cert]
          )
          if requires_verification
            project.saml_setting.update(test_settings: form.attributes)
          else
            project.saml_setting.update!(form.attributes)
          end
          render json: project.saml_setting, serializer: ::Administration::Projects::SamlSettingSerializer,
                 requires_verification: requires_verification
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      private

      def resource_class
        @resource_class ||= ::SamlSetting
      end
    end
  end
end
