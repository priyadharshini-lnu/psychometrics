# frozen_string_literal: true

module Threesixty::EndUser
  class EvaluationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :evaluator_id, :campaign_id, :evaluator_nomination_status, :status,
               :subject_evaluation_closed, :assessment_extra, :assessment_id

    has_one :user, method: :user
    has_one :subject, method: :subject

    def subject
      UserSerializer.new.serialize(object.subject)
    end

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

    def user
      UserSerializer.new.serialize(object.evaluator)
    end

    def is_self
      object.subject_id == current_user.id
    end
  end
end
