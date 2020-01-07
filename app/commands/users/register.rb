# frozen_string_literal: true

module Users
  class Register < BaseCommand
    def initialize(form, project)
      @form = form
      @project = project
    end

    def call
      registration_code = project.project_registration_codes.find_by(code: form.registration_code)
      client = registration_code.end_level
      transaction do
        @user = create_user
        Administration::Clients::CreateUser.call(user, [client]) do
          on(:license_error) { |_form, e| raise e }
          on(:ok) do
            increment_registration_code_usage(registration_code)
            update_license_use(user, client, registration_code)
          end
        end
      end
      broadcast(:ok, user)
    rescue ActiveRecord::RecordInvalid, Errors::LicenseError => e
      form.errors.add(:base, e.message)
      broadcast(:error, form)
    end

    private

    attr_reader :form, :user, :project, :membership

    def create_user
      attributes = form.attributes.except(:registration_code)
      attributes[:project_id] = project.id
      attributes[:terms] = true
      attributes[:create_by_invite] = true
      User.create(attributes)
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
