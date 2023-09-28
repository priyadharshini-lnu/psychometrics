# frozen_string_literal: true

module AdminJobs
  class ImportSmsInvites < AdminJobs::Base
    def call
      rows = CSV.parse(URI(record.file.url).open, headers: :first_row).map(&:to_h)
      ::SmsInvites::Import.call!(campaign, rows, record)

      broadcast :ok
    end

    def generate_title_link
      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants/sms_invites",
        label: campaign.name
      }
    end

    def valid?
      campaign.present?
    end
  end
end
