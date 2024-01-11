# frozen_string_literal: true

module AdminJobs
  class SendSmsInvites < AdminJobs::Base
    def call
      data = ::SmsInvites::SendSmsInvites.call!(sms_record, record)

      broadcast :ok, { error_messages: data[:errors] }
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants/sms_invites",
        label: campaign.name
      }
    end

    def valid?
      campaign.present? && sms_record.present?
    end

    def sms_record
      @sms_record ||= SmsRecord.find_by(id: record.data['sms_record_id'])
    end
  end
end
