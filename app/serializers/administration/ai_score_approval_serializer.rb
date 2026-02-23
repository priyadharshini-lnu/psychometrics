# frozen_string_literal: true

module Administration
  class AIScoreApprovalSerializer < Panko::Serializer
    attributes :id, :questions, :competencies, :indicators, :results, :media_responses, :review_as, :approval_status,
               :allow_approve, :campaign_name, :subject_name, :project_name, :client_name, :subject_email,
               :assessed_by, :approved_by

    def questions
      object.assessment.scorable_ai_questions.order(:position)
    end

    def results
      object.users_result.answers.select do |question_id|
        question_id.to_i.in?(scorable_question_ids)
      end
    end

    def competencies
      Panko::ArraySerializer.new(
        object.users_result.ai_factor_scores.where(parent_factor_id: nil),
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a
    end

    def indicators
      Panko::ArraySerializer.new(
        object.users_result.ai_factor_scores.where.not(parent_factor_id: nil),
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a.group_by { |a| a['question_id'] }
    end

    def media_responses
      object.assessment.scorable_ai_questions.to_h do |question|
        active_response = object.users_result.active_media_response(question)
        if active_response
          [question.id, [MediaResponseSerializer.new.serialize(active_response)]]
        else
          [question.id, []]
        end
      end
    end

    def review_as
      return 'approver' if approver? || approval_settings.one_level_approve?

      'assessor'
    end

    def allow_approve
      return true if approval_settings.one_level_approve? && approver? && object.pending?
      return true if assessor? && object.pending?
      return true if approver? && object.assessor_approved?

      false
    end

    def campaign_name
      object.campaign.name
    end

    def project_name
      object.project.name
    end

    def client_name
      object.client.name
    end

    def subject_name
      object.subject.name
    end

    def subject_email
      object.subject.email
    end

    def assessed_by
      object.score_assessed_by&.name
    end

    def approved_by
      object.score_approved_by&.name
    end

    private

    def current_user
      context[:current_user]
    end

    def scorable_question_ids
      @scorable_question_ids ||= object.assessment.scorable_ai_questions.ids # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
    end

    def approval_settings
      ua = object.as_user_assessment
      @approval_settings ||= AI::ScoringApprovalSetting.find_by( # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
        campaign_id: ua.campaign_id, assessment_id: ua.assessment_id
      )
    end

    def assessor?
      approval_settings.assessor_ids.include?(current_user.id)
    end

    def approver?
      approval_settings.approver_ids.include?(current_user.id)
    end
  end
end
