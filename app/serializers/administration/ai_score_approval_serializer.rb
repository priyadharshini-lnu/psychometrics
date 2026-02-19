# frozen_string_literal: true

module Administration
  class AIScoreApprovalSerializer < Panko::Serializer
    attributes :id, :questions, :competencies, :indicators, :results, :media_responses, :review_as, :approval_status,
               :allow_approve

    def questions
      object.assessment.scorable_ai_questions
    end

    def results
      object.as_user_assessment.users_result.answers.select do |question_id|
        question_id.to_i.in?(scorable_question_ids)
      end
    end

    def competencies
      Panko::ArraySerializer.new(
        object.as_user_assessment.users_result.ai_factor_scores.where(parent_factor_id: nil),
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a
    end

    def indicators
      Panko::ArraySerializer.new(
        object.as_user_assessment.users_result.ai_factor_scores.where.not(parent_factor_id: nil),
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a.group_by { |a| a['question_id'] }
    end

    def media_responses
      Panko::ArraySerializer.new(
        object.as_user_assessment.users_result.media_responses.where(question_id: scorable_question_ids).
          order(:created_at),
        each_serializer: MediaResponseSerializer
      ).to_a.group_by { |a| a['question_id'] }
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
