# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status, :start_date, :end_date,
               :groups, :ungrouped_assessments_ids, :campaign_user

    has_one :campaign_options, serializer: ::EndUser::CampaignOptionsSerializer
    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer
    has_many :user_reports, serializer: ::EndUser::UserReportSerializer
    has_many :groups, serializer: ::EndUser::GroupSerializer

    def status
      return object.status unless object.fixed_time?
      return object.status if campaign_time_extended?
      return object.status if campaign_user_object.completed_at.blank?

      expected_end_time = campaign_user_object.started_at + object.fixed_time_duration.minutes
      expected_end_time += campaign_user_object.additional_time.minutes if campaign_user_object.additional_time?

      return 'closed' if (expected_end_time < Time.now) && object.active?

      object.status
    end

    def campaign_user
      attributes = %i[ id campaign_id user_id active started_at completed_at expiry_date
                       completed_via completion_status additional_time updated_at ]

      values = campaign_user_object.slice(*attributes)
      return values unless object.fixed_time?
      return values if user_assessments.none?

      unless campaign_user_object.started_at
        values['expiry_date'] = nil
        values['completion_status'] = :not_started

        return values
      end

      unless campaign_user_object.interrupted_campaign?
        completed_at = campaign_user_object.started_at + object.fixed_time_duration.minutes
        completed_at += campaign_user_object.additional_time.minutes if campaign_user_object.additional_time

        campaign_closed = Time.now > completed_at
        values['completed_at'] = completed_at if campaign_closed
        values['completion_status'] = determine_completion_status(campaign_closed)
      end

      values
    end

    def groups
      object.campaign_assessment_groups.order(:position)
    end

    def user_assessments
      UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id)
    end

    def user_reports
      object.user_reports.eager_load(:report).
        where(user_id: current_user.id, user_access: true).
        merge(Report.assignable)
    end

    def campaign_user_object
      object.campaign_users.find_by(user_id: current_user.id)
    end

    def ungrouped_assessments_ids
      object.campaign_assessments.ungrouped.order(:position).map(&:assessment_id)
    end

    private

    def campaign_time_extended?
      !!campaign_user_object.additional_time && campaign_user_object.expiry_date.blank?
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end

    def determine_completion_status(campaign_closed)
      return :completed if campaign_closed

      campaign_user_object.user_assessments.all?(&:completed?) ? :completed : :in_progress
    end
  end
end
