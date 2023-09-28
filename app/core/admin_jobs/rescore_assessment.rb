# frozen_string_literal: true

module AdminJobs
  class RescoreAssessment < AdminJobs::Base
    def call
      if campaign_assessment
        norm_id = if campaign_assessment.has_external_norm?
                    campaign_assessment.external_norm_id
                  else
                    campaign_assessment.norm_id
                  end

        norm_data = {
          norm_id: norm_id,
          fixed_norm: record.data['fixed_norm'],
          nullifly_norm: true
        }
      end
      record.update(total_tasks: results.count)
      results.find_each do |res|
        record.increment_completed_tasks!
        ::UsersResults::Recompute.call!(res, owner, norm_data || {})
      end
      remove_report_pdf if campaign.threesixty?
      broadcast :ok
    end

    def generate_title_link
      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
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

    def remove_report_pdf
      campaign.user_reports.each do |ur|
        ur.update!(remove_pdf: true, status: :not_prepared)
      end
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
