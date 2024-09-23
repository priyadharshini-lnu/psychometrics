# frozen_string_literal: true

module Users
  module Registration
    class WithRegistrationCode < BaseCommand
      private_attr_reader :form, :project, :registration_code, :client

      def initialize(form, project)
        @form = form
        @project = project
        @registration_code = project.project_registration_codes.find_by(code: form.registration_code)
        @client = registration_code.end_level || registration_code.project
      end

      def call
        transaction do
          broadcast(:ok, create_user)
        end
      rescue ActiveRecord::RecordInvalid, Errors::LicenseError => e
        form.errors.add(:base, e.message)
        broadcast(:error, form)
      end

      private

      def create_user
        user_form = Campaigns::Users::CreateForm.new(form.attributes.slice(:first_name, :last_name, :email,
                                                                           :mobile_number, :mobile_verified))
        Campaigns::Users::Create.call(user_form, registration_code.campaign) do
          on(:insufficient_license) do
            raise Errors::LicenseError.new(client, nil, user, 'LicenseError')
          end
          on(:ok) do
            increment_registration_code_usage(registration_code)
            update_license_use(user, client, registration_code)
          end
        end
      end

      def increment_registration_code_usage(registration_code)
        registration_code.increment!(:use_count)
      end

      def update_license_use(user, project, registration_code)
        user.license_usages.where(
          client_id: project.tte_id
        ).update(registration_code_id: registration_code.id)
      end
    end
  end
end
