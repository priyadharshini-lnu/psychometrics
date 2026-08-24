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

      sent_legacy = send_legacy_magic_link_email(user)
      sent_delivery = send_delivery_magic_link_email(user)
      MagicLinkLoginMailer.magic_link_email(user).deliver_now unless sent_legacy || sent_delivery

      siem_log_token_issuance(user, 'MagicLink',
                              context: "User: #{SiemLogger.user_identifier(user.email, user.id)}")

      broadcast :ok
    end

    private

    def send_legacy_magic_link_email(user)
      communication = Communication.magic_link_email.where(project_id: project.id).last
      return false unless communication

      communication.emails.create(user_id: user.id)
      true
    end

    # Additive path onto CommunicationDelivery, see Communications::Deliveries::Trigger for the
    # 'magic_link_email' kind's dispatch-on-create-only shape; this is the actual send trigger.
    def send_delivery_magic_link_email(user)
      return false unless project.client.feature_enabled?(:use_new_communication_center)

      delivery = CommunicationDelivery.joins(:communication_template).
                 find_by(communication_templates: { kind: :magic_link_email }, project_id: project.id, status: :active)
      return false unless delivery

      CommunicationEmail.create!(communication_delivery: delivery, user: user)
      true
    end
  end
end
