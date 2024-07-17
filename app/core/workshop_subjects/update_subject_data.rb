# frozen_string_literal: true

module WorkshopSubjects
  class UpdateSubjectData < BaseCommand
    attr_accessor :subject_id, :campaign_id, :params, :retain_assessor_user_assessment_ids

    def initialize(subject_id, campaign_id, params)
      @subject_id = subject_id
      @campaign_id = campaign_id
      @params = params
      @retain_assessor_user_assessment_ids = []
    end

    def call
      update_subject
      broadcast :ok, workshop_subject
    end

    private

    def update_subject
      WorkshopSubject.transaction do
        update_subject_data
        process_assessor_assessments
        remove_assessor_assessments
      end
    end

    def update_subject_data
      workshop_subject.update!(attendance_status: params[:attendance_status], late_duration: params[:late_duration])
    end

    def process_assessor_assessments
      params[:assessor_assessments].each do |assessor_assessment|
        assessor_user_assessment = if assessor_assessment[:campaign_assessor_assessment_id]
                                     create_assessor_user_assessment(assessor_assessment)
                                   else
                                     update_existing_assessor_user_assessment(assessor_assessment)
                                   end
        retain_assessor_user_assessment_ids << assessor_user_assessment.id if assessor_user_assessment
      end
    end

    def update_existing_assessor_user_assessment(assessor_assessment)
      assessor_user_assessment = UserAssessment.find(assessor_assessment[:id])
      linked_subject_user_assessment = assessor_user_assessment.linked_subject_user_assessment

      if (
        assessor_assessment[:meeting_link] || assessor_assessment[:meeting_type]
      ) && linked_subject_user_assessment.nil?
        return broadcast :error, [
          {
            assessor_forms: I18n.t('administration.workshop_subjects.errors.update_assessor_for_failure')
          }
        ]
      end
      update_assessor_user_assessment(assessor_user_assessment, assessor_assessment)
      assessor_user_assessment
    end

    def update_assessor_user_assessment(assessor_user_assessment, assessor_assessment)
      assessor_user_assessment.update!(schedule_time: assessor_assessment[:schedule_time])

      assessor_user_assessment.linked_subject_user_assessment&.update!(
        meeting_link: assessor_assessment[:meeting_link],
        meeting_type: assessor_assessment[:meeting_type]
      )
    end

    def create_assessor_user_assessment(assessor_assessment)
      assessor_user_assessment = UserAssessment.create!(
        assessment_id: assessor_assessment[:assessment_id],
        campaign_id: campaign_id,
        subject_id: workshop_subject.user_id,
        evaluator_id: assessor_assessment[:assessor][:id],
        relationship: Relationship.assessor_relationship,
        users_result: UsersResult.create!
      )
      update_assessor_user_assessment(assessor_user_assessment, assessor_assessment)
      assessor_user_assessment
    end

    def remove_assessor_assessments
      assessor_user_assessments_to_delete = UserAssessment.where(
        relationship_id: Relationship.assessor_relationship.id,
        subject_id: workshop_subject.user_id,
        campaign_id: campaign_id
      ).where.not(id: retain_assessor_user_assessment_ids)

      return if assessor_user_assessments_to_delete.blank?

      assessor_user_assessments_to_delete.each do |ua|
        ua.linked_subject_user_assessment&.update!(meeting_link: nil, meeting_type: nil)
      end

      assessor_user_assessments_to_delete.destroy_all
    end

    def workshop_subject
      @workshop_subject ||= WorkshopSubject.find(subject_id)
    end
  end
end
