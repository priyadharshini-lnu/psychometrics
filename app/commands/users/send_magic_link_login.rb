# frozen_string_literal: true

module Users
  class SendMagicLinkLogin < BaseCommand
    include SiemLogger::ControllerHelper

    attr_reader :project, :email

    def initialize(project, email)
      @project = project
      @email = email
    end

    def call
      user = project.project_users.find_by(email: email)
      return broadcast :ok unless user

      communication = Communication.magic_link_email.where(project_id: project.id).last

      if communication
        communication.emails.create(user_id: user.id)
      else
        MagicLinkLoginMailer.magic_link_email(user).deliver_now
      end

      siem_log_token_issuance(user, 'MagicLink',
                              context: "User: #{SiemLogger.user_identifier(user.email, user.id)}")

      broadcast :ok
    end
  end
end
