# frozen_string_literal: true

module WorkshopSubjects
  class GetAssessorAssessments < BaseCommand
    private_attr_reader :workshop_subject_id, :campaign_id, :assessor_relationship_id

    def initialize(workshop_subject_id:, campaign_id:)
      @workshop_subject_id = workshop_subject_id
      @campaign_id = campaign_id
      @assessor_relationship_id ||= Relationship.assessor_relationship.id
    end

    def call
      assessor_assessments = []
      campaign_assessor_assessments = CampaignAssessorAssessment.where(campaign_id: campaign_id)

      user_assessments = UserAssessment.where(
        relationship_id: assessor_relationship_id,
        subject_id: workshop_subject.user_id,
        campaign_id: campaign_id,
        assessment_id: campaign_assessor_assessments.pluck(:assessment_id)
      ).index_by(&:assessment_id)

      campaign_assessor_assessments.each do |campaign_assessor_assessment|
        user_assessment = user_assessments[campaign_assessor_assessment.assessment_id]
        linked_activity = CampaignAssessment.find_by(
          assessor_form_id: campaign_assessor_assessment.assessment_id,
          campaign_id: campaign_id
        )

        assessor_assessment = {
          id: campaign_assessor_assessment.id.to_s,
          name: campaign_assessor_assessment.assessment.name,
          user_assessment_id: user_assessment&.id,
          status: user_assessment&.status,
          schedule: user_assessment&.schedule_time,
          meeting_link: user_assessment&.meeting_link,
          linked_activity: linked_activity&.assessment&.name,
          assessor: user_assessment&.evaluator && {
            id: user_assessment.evaluator.id,
            name: user_assessment.evaluator.name,
            photo_url: user_assessment.evaluator.photo_url
          }
        }

        assessor_assessments << assessor_assessment
      end

      broadcast :ok, assessor_assessments
    end

    private

    def workshop_subject
      @workshop_subject ||= WorkshopSubject.find(workshop_subject_id)
    end
  end
end
