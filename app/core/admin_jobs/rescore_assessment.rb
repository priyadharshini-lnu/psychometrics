# frozen_string_literal: true

module AdminJobs
  class RescoreAssessment < AdminJobs::Base
    def call
      if assessment.yoodli?
        handle_yoodli_import
        return
      end

      record.update(total_tasks: results.count)

      results.find_each(batch_size: 200) do |res|
        user_assessment = res.user_assessment
        user_assessment.update_norm!(record.data['norm_id']) if record.data['norm_id'].present?

        recompute = ::UsersResults::Recompute.new(
          res,
          owner,
          admin_job_record_id: record.id,
          allow_ai_rescore: record.data['allow_ai_rescore'],
          force_ai_regenerate: false
        )
        recompute.on(:ok) { record.increment_completed_tasks! }
        recompute.on(:waiting) { nil }
        recompute.call
      end

      remove_reports_pdf if campaign.threesixty?
      broadcast :waiting
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{assessment.name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.assessments.assessment'), assessment.name]
      ]
    end

    def valid?
      campaign.present? && assessment.present?
    end

    private

    def handle_yoodli_import
      record.update(total_tasks: 1)
      begin
        result = YoodliDailyImportJob.perform_now(nil, campaign.id)
        record.increment_completed_tasks!

        if result && result[:success] == false
          broadcast :ok, error_messages: result[:errors]
        else
          broadcast :ok
        end
      rescue StandardError => e
        broadcast :ok, error_messages: ["Yoodli import failed: #{e.message}"]
      end
    end

    def remove_reports_pdf
      campaign.user_reports.each(&:remove_report_pdf!)
    end

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find_by(
        campaign_id: record.data['campaign_id'], assessment: record.data['assessment_id']
      )
    end

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end

    def results
      @results ||= UsersResult.
                   includes(user_assessment: %i[assessment subject project evaluator microsite_user_assessment]).
                   preload(user_assessment: { assessment: { dimension: %i[occupations innovation_styles] } }).
                   where(
                     user_assessments: {
                       assessment_id: record.data['assessment_id'],
                       campaign_id: record.data['campaign_id']
                     }
                   )
    end
  end
end
