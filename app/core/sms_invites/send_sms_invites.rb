# frozen_string_literal: true

module SmsInvites
  class SendSmsInvites < BaseCommand
    private_attr_reader :sms_record, :campaign, :job_record

    def initialize(sms_record, job_record)
      @sms_record = sms_record
      @job_record = job_record
      @campaign = sms_record.campaign
    end

    def call
      sms_invites = campaign.sms_invites.ransack(sms_record.filters).result
      job_record.update!(total_tasks: sms_invites.length)

      sms_invites.find_each do |sms_invite|
        sms_invite.update(code: SecureRandom.alphanumeric(6), expiry: sms_record.link_expiry)
        message = SmsInvites::ReplacePipeText.call!(sms_record.message, sms_invite)
        Sms::Send.call!(sms_invite.mobile_no, message)
        sms_invite.invited!
        job_record.increment_completed_tasks!
      end
    end
  end
end
