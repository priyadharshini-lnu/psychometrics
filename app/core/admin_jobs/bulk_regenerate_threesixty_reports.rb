# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateThreesixtyReports < AdminJobs::Base
    def call
      campaign_options = threesixty_campaign.option
      user_reports = threesixty_campaign.campaign.user_reports

      user_reports = user_reports.where(id: record.data['ids']) if record.data['ids'].present?

      subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        user_reports.pluck(:user_id),
        threesixty_campaign
      )

      available_user_reports_ids = []
      error_messages = []

      user_reports.includes(:subject, :user).find_each(batch_size: 100) do |user_report|
        availability_result = Threesixty::Subjects::IsReportAvailable.call!(
          user_report.subject,
          campaign_options,
          subject_evaluator_counters.dig(user_report.user_id, :completed) || {}
        )

        if availability_result[:available]
          available_user_reports_ids << user_report.id
        elsif availability_result[:status_message]
          error_messages << availability_result[:status_message]
        end
      end

      return broadcast :ok, { error_messages: error_messages } if available_user_reports_ids.empty?

      record.update(data: record.data.merge(user_reports_ids: available_user_reports_ids))

      available_user_reports = campaign.user_reports.where(id: available_user_reports_ids)
      ::UserReports::GenerateAndSavePdf.call!(available_user_reports, owner, options, record)

      broadcast :waiting
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants/subjects/",
        label: "#{campaign.name} Reports"
      }
    end

    def generate_details
      [
        [I18n.t('administration.reports.regenerated_count'), user_reports.count]
      ]
    end

    def valid?
      campaign.present?
    end

    private

    def user_reports
      @user_reports ||= campaign&.user_reports&.where(id: record.data['user_reports_ids'])
    end

    def campaign
      threesixty_campaign.campaign
    end

    def threesixty_campaign
      @threesixty_campaign ||= ::Threesixty::Campaign.find(record.data['campaign_id'])
    end

    def campaign_report
      @campaign_report ||= CampaignReport.includes(:report).find_by!(report_id: threesixty_campaign.report_id,
                                                                     campaign_id: threesixty_campaign.campaign_id)
    end

    def options
      {
        locales: record.data['locales'] || [campaign_report.effective_default_language],
        force_regenerate: record.data['force_regenerate']
      }
    end
  end
end
