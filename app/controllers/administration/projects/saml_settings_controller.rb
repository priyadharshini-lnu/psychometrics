# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def create
        form = SamlSettings::Form.from_params(resource_params).with_context(new_record: true)
        if form.valid?
          project.create_saml_setting(test_settings: form.attributes)
          render json: ::Administration::Projects::SamlSettingSerializer.new(
            context: {
              requires_verification: true
            }
          ).serialize(project.saml_setting)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = SamlSettings::Form.from_params(resource_params)
        return render json: { errors: form.errors.messages }, status: 422 unless form.valid?

        if form.clear_saml_setting?
          requires_verification = false
          project.saml_setting.update(SamlSettings::Form.new.attributes)
        else
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
        end

        render json: ::Administration::Projects::SamlSettingSerializer.new(
          context: {
            requires_verification: requires_verification
          }
        ).serialize(project.saml_setting)
      end

      def destroy
        project.saml_setting.destroy!

        head :ok
      end

      private

      def resource_class
        @resource_class ||= ::SamlSetting
      end
    end
  end
end
