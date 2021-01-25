# frozen_string_literal: true

module AdminJobs
  class RescoreAssessment < AdminJobs::Base
    def call
      norm_data = {
        norm_id: campaign_assessment.norm_id
      }

      results.find_each do |res|
        ::UsersResults::Recompute.call!(res, owner, norm_data)
      end
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

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find_by(id: record.data['campaign_assessment_id'])
    end

    def campaign
      campaign_assessment&.campaign
    end

    def assessment
      campaign_assessment&.assessment
    end

    def results
      UsersResult.joins(:user_assessment).
        where(
          assessment_id: campaign_assessment.assessment_id,
          user_assessments: { campaign_id: campaign_assessment.campaign_id },
          status: :completed
        ).
        includes(:evaluator)
    end
  end
end
