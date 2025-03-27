# frozen_string_literal: true

module Administration
  module Projects
    class SamlSettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def create
        form = SamlSettings::Form.from_params(resource_params).with_context(new_record: true)
        if form.valid?
          project.create_saml_setting(form.attributes)
          render json: ::Administration::Projects::SamlSettingSerializer.new.serialize(project.saml_setting)
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

        render json: ::Administration::Projects::SamlSettingSerializer.new.serialize(project.saml_setting)
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
