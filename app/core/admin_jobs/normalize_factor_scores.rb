# frozen_string_literal: true

module AdminJobs
  class NormalizeFactorScores < AdminJobs::Base
    def call
      unless campaign_assessment.assessment.project_assessments.exists?(
        project_id: campaign.project_id, normalize_factor_scores: true
      )
        broadcast :ok, {
          error_messages: [
            I18n.t('campaign_assessment.normalize_factor_scores.normalization_not_allowed')
          ]
        }
      end

      user_assessments = assessment.user_assessments.where(
        campaign_id: campaign.id
      ).includes(:users_result, :user_assessment_factor_scores)

      user_assessments.find_each do |user_assessment|
        ::UserAssessments::NormalizeFactorScores.call!(user_assessment)
      end

      broadcast :ok
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - Normalize Factor Scores"
      }
    end

    def generate_details
      [
        [I18n.t('common.model.assessment'), assessment.name]
      ]
    end

    def valid?
      campaign.present?
    end

    def assessment
      @assessment ||= campaign_assessment&.assessment
    end

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find_by(id: record.data['campaign_assessment_id'])
    end

    def campaign
      @campaign ||= campaign_assessment&.campaign
    end
  end
end
