# frozen_string_literal: true

class AssessorNotificationMailer < ApplicationMailer
  layout 'admin_email'

  def new_assignment(assessor_id, user_assessments_ids)
    @assessor_user = Assessor.joins(:user).find(assessor_id).user

    @grouped_subjects = get_grouped_subjects_with_assessments(user_assessments_ids)

    first_project = UserAssessment.where(id: user_assessments_ids).first&.project
    send_email(
      @assessor_user,
      subject: t('administration.assessor.mailer.subject'),
      template_path: 'mailer/assessor_notification',
      template_name: 'new_assignment',
      **admin_sender_attributes(first_project&.client)
    )
  end

  private

  def get_grouped_subjects_with_assessments(user_assessments_ids)
    user_assessments = UserAssessment.includes(:subject, :assessment, :project, :campaign).
                       where(id: user_assessments_ids)

    grouped_assessments = user_assessments.group_by do |assessment|
      [assessment.project, assessment.campaign]
    end

    grouped_assessments.map do |(project, campaign), grouped_assessment|
      {
        project_name: project.name,
        campaign_name: campaign.name,
        campaign_id: campaign.id,
        subjects: get_subjects_with_assessments(grouped_assessment)
      }
    end
  end

  def get_subjects_with_assessments(grouped_assessment)
    subjects_hash = grouped_assessment.group_by(&:subject)

    subjects_hash.
      transform_values do |user_assessments|
        user_assessments.map { |user_assessment| user_assessment.assessment.name }
      end.
      map do |subject, assessment_names|
        { name: subject.decorate.display_name, assessments: assessment_names }
      end
  end
end
