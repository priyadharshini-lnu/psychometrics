# frozen_string_literal: true

module Administration
  module Administrator
    class PasswordsController < Devise::PasswordsController
      helper_method :resource_name, :devise_mapping

      before_action :determine_client, only: [:create]

      def resource_name
        :user
      end

      def devise_mapping
        @devise_mapping ||= Devise.mappings[:user]
      end

      def create
        self.resource = find_user_by(resource_params['email'])

        resource_class.send_reset_password_instructions(resource) if resource
        if resource && successfully_sent?(resource)
          respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
        else
          self.resource = resource_class.new
          set_flash_message! :alert, :wrong_email
          render :new
        end
      end

      protected

      def after_sending_reset_password_instructions_path_for(_resource_name)
        if resource.is?(:superadmin, :client_admin, :project_admin)
          administration_root_path
        else
          super
        end
      end

      private

      def determine_client
        subdomain = request.subdomain
        subdomain.gsub!(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
        @client = Client.enabled.find_by(subdomain: subdomain)
      end

      def find_user_by(email)
        @client ? @client.users.find_by(email: email) : User.find_by(email: email)
      end
    end
  end
end
