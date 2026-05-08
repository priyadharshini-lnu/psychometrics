# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def create
        form = SamlSettings::Form.from_params(resource_params).with_context(new_record: true)
        if form.valid?
          saml_setting = project.create_saml_setting(form.attributes)
          audit! :create, saml_setting, payload: resource_params, project: project
          render json: ::Administration::Projects::SamlSettingSerializer.new.serialize(saml_setting)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = SamlSettings::Form.from_params(resource_params)
        return render json: { errors: form.errors.messages }, status: 422 unless form.valid?

        if form.clear_saml_setting?
          project.saml_setting.update(SamlSettings::Form.new.attributes)
        else
          project.saml_setting.update!(form.attributes)
        end

        audit! :update, project.saml_setting, payload: resource_params, project: project

        render json: ::Administration::Projects::SamlSettingSerializer.new.serialize(project.saml_setting)
      end

      def destroy
        saml_setting = project.saml_setting
        saml_setting.destroy!
        audit! :delete, saml_setting, payload: saml_setting.log_attribute_for_delete, project: project

        head :ok
      end

      private

      def resource_class
        @resource_class ||= ::SamlSetting
      end
    end
  end
end
