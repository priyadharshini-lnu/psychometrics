# frozen_string_literal: true

module WorkshopSubjects
  class UpdateSubjectData < BaseCommand
    attr_accessor :subject_id, :campaign_id, :params

    def initialize(subject_id, campaign_id, params)
      @subject_id = subject_id
      @campaign_id = campaign_id
      @params = params
    end

    def call
      update_subject
      broadcast :ok, workshop_subject
    end

    private

    def update_subject
      WorkshopSubject.transaction do
        update_subject_data
        update_subject_assessments
        update_assessor_assessments
      end
    end

    def update_subject_data
      workshop_subject.update!(attendance_status: params[:attendance_status], late_duration: params[:late_duration])
    end

    def update_assessor_assessments
      params[:assessor_assessments].each do |assessor_assessment|
        assessor_id = assessor_assessment.dig(:assessor, :id)
        if assessor_id
          Assessor.find_or_create_by!(user_id: assessor_id, campaign_id: campaign_id)
          find_or_update_assessor_assessment(assessor_assessment)
        elsif assessor_assessment[:user_assessment_id]
          UserAssessment.find_by(campaign_id: campaign_id, id: assessor_assessment[:user_assessment_id])&.destroy!
        end
      end
    end

    def update_subject_assessments
      assessments_data = params[:assessments]

      assessments_data.each do |assessment_data|
        user_assessment = UserAssessment.find(assessment_data[:id])
        user_assessment.update!(schedule_time: assessment_data[:schedule_time])
      end
    end

    def find_or_update_assessor_assessment(assessment_data)
      user_assessment = UserAssessment.find_or_create_by(
        assessment_id: campaign_assessor_assessment(assessment_data).assessment_id,
        campaign_id: campaign_id,
        subject_id: workshop_subject.user_id,
        evaluator_id: assessment_data[:assessor][:id],
        relationship_id: Relationship.assessor_relationship.id
      )

      linked_subject_user_assessment = user_assessment.linked_subject_user_assessment

      if (assessment_data[:meeting_link] || assessment_data[:meeting_link_type]) && linked_subject_user_assessment.nil?
        return broadcast :error, [
          {
            assessor_forms: I18n.t('administration.workshop_subjects.errors.update_assessor_for_failure')
          }
        ]
      end

      user_assessment.schedule_time = assessment_data[:schedule_time]
      user_assessment.users_result = UsersResult.create! if user_assessment.users_result.blank?
      user_assessment.save!

      user_assessment.linked_subject_user_assessment&.update!(
        meeting_link: assessment_data[:meeting_link],
        meeting_type: assessment_data[:meeting_link_type]
      )
    end

    def campaign_assessor_assessment(assessment_data)
      CampaignAssessorAssessment.find(assessment_data[:id])
    end

    def workshop_subject
      @workshop_subject ||= WorkshopSubject.find(subject_id)
    end
  end
end
