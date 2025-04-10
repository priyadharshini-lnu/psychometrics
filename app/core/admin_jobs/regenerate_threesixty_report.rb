# frozen_string_literal: true

module AdminJobs
  class RegenerateThreesixtyReport < AdminJobs::Base
    def call
      if available?
        user_reports = campaign.user_reports.where(user_id: subject.user_id)
        ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, options, record)
      else
        return broadcast :ok, content: "Report can't be generated"
      end

      broadcast :waiting
    end

    def available?
      options = threesixty_campaign.option
      subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        [subject.user_id],
        threesixty_campaign
      )

      Threesixty::Subjects::IsReportAvailable.call!(
        subject,
        options,
        subject_evaluator_counters.dig(subject.user_id, :completed) || {}
      )
    end

    def generate_title_link
      # rubocop:disable Layout/LineLength
      {
        href: "/admin/clients/#{campaign.client.id}/projects/#{campaign.project_id}/threesixty_campaigns/#{threesixty_campaign.id}/participants/subjects",
        label: "#{campaign.name} Report"
      }
      # rubocop:enable Layout/LineLength
    end

    def generate_details
      [
        [I18n.t('administration.reports.regenerated'), subject.user.name]
      ]
    end

    def valid?
      campaign.present? && subject.present?
    end

    private

    def campaign
      @campaign ||= threesixty_campaign.campaign
    end

    def subject
      @subject ||= Threesixty::Subject.find(record.data['subject_id'])
    end

    def threesixty_campaign
      @threesixty_campaign ||= ::Threesixty::Campaign.find(record.data['threesixty_campaign_id'])
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
