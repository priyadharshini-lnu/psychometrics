# frozen_string_literal: true

module SmsInvites
  class SendSmsInvites < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :sms_record, :campaign, :job_record

    def initialize(sms_record, job_record)
      @sms_record = sms_record
      @job_record = job_record
      @campaign = sms_record.campaign
    end

    def call
      sms_invites = campaign.sms_invites.ransack(sms_record.filters).result
      job_record.update!(total_tasks: sms_invites.length)
      errors = []
      sms_invites.find_each do |sms_invite|
        sms_invite.update(code: SecureRandom.alphanumeric(6), expiry: sms_record.link_expiry)
        message = SmsInvites::ReplacePipeText.call!(sms_record.message, sms_invite)
        sms_history = SmsHistory.create(
          sms_invite.slice(:first_name, :last_name, :mobile_no).merge(sms_record: sms_record)
        )
        begin
          message = Sms::Send.call!(sms_invite.mobile_no, message, status_callback: status_callback(sms_history))
          sms_history.update!(twilio_sid: message.sid)
          UpdateSmsHistoryJob.set(wait: 1.minute).perform_later(sms_history)
        rescue Twilio::REST::RestError
          sms_invite.failed!
          errors << I18n.t('administration.sms_invites.messages.failed_to_sent_invite', mobile_no: sms_invite.mobile_no)
          next
        end

        sms_invite.invited!
        job_record.increment_completed_tasks!
      end
      broadcast :ok, { errors: errors }
    end

    def status_callback(sms_history)
      token = JWT.encode(
        { data: sms_history.id, exp: 1.day.from_now.to_i },
        Settings.secrets.webhook_jwt_secret
      )
      webhooks_sms_histories_url(
        token: token,
        host: Settings.domain,
        subdomain: Settings.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end
  end
end
