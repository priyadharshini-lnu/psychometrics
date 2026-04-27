# frozen_string_literal: true

module Threesixty::EndUser
  class EvaluationSerializer < Panko::Serializer
    attributes :id, :is_self, :evaluator_id, :campaign_id, :evaluator_nomination_status, :status,
               :subject_evaluation_closed, :assessment_extra, :assessment_id, :available_languages,
               :default_language, :should_run_assessment_level_checks

    has_one :user, serializer: UserSerializer
    has_one :subject, serializer: UserSerializer

    delegate :available_languages, :default_language, to: :assessment

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def assessment_id
      object.assessment.id
    end

    def assessment_extra
      object.assessment.extra
    end

    def status
      object.result&.status
    end

    def subject_evaluation_closed
      object.threesixty_subject.evaluation_status_completed?
    end

    def is_self
      object.subject_id == current_user.id
    end

    def should_run_assessment_level_checks
      object.campaign.should_run_assessment_level_checks?
    end

    private

    def current_user
      context[:current_user]
    end

    def assessment
      object.assessment
    end
  end
end
