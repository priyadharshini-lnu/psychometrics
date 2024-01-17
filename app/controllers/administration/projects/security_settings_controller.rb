# frozen_string_literal: true

module Administration
  module Projects
    class SecuritySettingsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update]

      def update
        form = SecuritySettings::Form.from_params(resource_params)
        if form.valid?
          project.security_setting.update(form.attributes)
          audit! :update, project.security_setting, payload: resource_params
          render json: ::Administration::Projects::SecuritySettingSerializer.new.serialize(project.security_setting)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      private

      def resource_class
        @resource_class ||= ::SecuritySetting
      end
    end
  end
end
