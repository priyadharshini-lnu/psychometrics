# frozen_string_literal: true

module SmsInvites
  class Import < BaseCommand
    private_attr_reader :campaign, :rows, :job_record

    def initialize(campaign, rows, job_record)
      @campaign = campaign
      @rows = rows
      @job_record = job_record
    end

    def call
      job_record.update!(total_tasks: rows.length)

      rows.each do |attrs|
        campaign.sms_invites.create(attrs.merge(creator_id: job_record.owner_id))
        job_record.increment_completed_tasks!
      end

      broadcast :ok
    end
  end
end
