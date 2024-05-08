# frozen_string_literal: true

module AdminJobs
  class RescoreAssessment < AdminJobs::Base
    def call
      record.update(total_tasks: results.count)
      results.find_each do |res|
        record.increment_completed_tasks!
        user_assessment = res.user_assessment
        user_assessment.update_norm!(record.data['norm_id']) if record.data['norm_id'].present?
        ::UsersResults::Recompute.call!(res, owner)
      end
      remove_reports_pdf if campaign.threesixty?
      broadcast :ok
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

    def remove_reports_pdf
      campaign.user_reports.each(&:remove_report_pdf!)
    end

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find_by(
        campaign_id: record.data['campaign_id'], assessment: record.data['assessment_id']
      )
    end

    def campaign
      Campaign.find_by(id: record.data['campaign_id'])
    end

    def assessment
      Assessment.find_by(id: record.data['assessment_id'])
    end

    def results
      UsersResult.joins(:user_assessment).
        where(
          user_assessments: {
            assessment_id: record.data['assessment_id'],
            campaign_id: record.data['campaign_id']
          }
        ).
        includes(user_assessment: :evaluator)
    end
  end
end
