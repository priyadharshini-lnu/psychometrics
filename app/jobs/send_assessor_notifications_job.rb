# frozen_string_literal: true

class SendAssessorNotificationsJob < ApplicationJob
  track_job_run

  def perform
    assessor_assessments_query.
      find_in_batches do |batch|
        grouped_assessments = batch.group_by(&:assessor)
        grouped_assessments.each do |assessor, user_assessments|
          send_assessor_notifications(assessor, user_assessments.pluck(:id))
        end
      end
  end

  private

  def assessor_assessments_query
    UserAssessment.
      joins(:campaign, :relationship).
      where(
        'user_assessments.created_at > :last_job_started_at
        AND user_assessments.created_at <= :current_started_at',
        {
          last_job_started_at: last_job_started_at,
          current_started_at: current_started_at
        }
      ).
      where(
        relationships: { name: Relationship::ASSESSOR },
        campaigns: { type: :common }
      )
  end

  def send_assessor_notifications(assessor, user_assessment_ids)
    AssessorNotificationMailer.
      new_assignment(assessor.id, user_assessment_ids).
      deliver_later

    EventDelivery.create!(
      event_type: :new_assessor_assessment,
      resource: assessor,
      delivery_type: :email,
      sent_at: Time.zone.now,
      meta: { user_assessment_ids: }
    )
  end
end
