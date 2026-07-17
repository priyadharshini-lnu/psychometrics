# frozen_string_literal: true

module Administration
  class AIScoreApprovalSerializer < Panko::Serializer
    attributes :id, :questions, :competencies, :indicators, :results, :media_responses, :highlight_anchors,
               :review_as, :approval_status, :allow_approve, :allow_bulk_approve_scores, :campaign_name,
               :subject_name, :project_name, :client_name, :subject_email,
               :assessment_name, :assessed_by, :approved_by, :result_stale

    def questions
      scorable_questions
    end

    def results
      object.users_result.answers.select do |question_id|
        question_id.to_i.in?(scorable_question_ids)
      end
    end

    def competencies
      Panko::ArraySerializer.new(
        all_factor_scores.select { |fs| fs.parent_factor_id.nil? },
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a
    end

    def indicators
      Panko::ArraySerializer.new(
        all_factor_scores.select { |fs| fs.parent_factor_id.present? },
        each_serializer: Administration::AIFactorScoreSerializer
      ).to_a.group_by { |a| a['question_id'] }
    end

    def media_responses
      scorable_questions.to_h do |question|
        response = active_media_responses_by_question[question.id]
        if response
          [question.id, [MediaResponseSerializer.new.serialize(response)]]
        else
          [question.id, []]
        end
      end
    end

    def highlight_anchors
      scorable_questions.to_h do |question|
        segments = active_media_responses_by_question[question.id]&.transcription&.segments
        citations = citations_by_question[question.id] || []
        anchors = AI::ContentAnalysis::HighlightAnchorBuilder.call(citations, segments)
        [question.id, anchors]
      end
    end

    def review_as
      return 'assessor' if superadmin? && object.pending?
      return 'approver' if superadmin? || approver? || approval_settings.one_level_approve?

      'assessor'
    end

    def allow_approve
      return false if object.approver_approved?

      policy.approve_question?
    end

    def allow_bulk_approve_scores
      object.allow_bulk_approve_scores?
    end

    def assessment_name
      object.assessment.name
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

    def result_stale
      AI::ContentAnalysis::StaleChecker.new(object).stale?
    end

    private

    def current_user
      context[:current_user]
    end

    def policy
      @policy ||= Api::Administration::AI::ScoreApprovalPolicy.new(current_user, object) # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
    end

    def scorable_questions
      @scorable_questions ||= object.assessment.scorable_ai_questions.order(:position).to_a # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
    end

    def scorable_question_ids
      @scorable_question_ids ||= scorable_questions.map(&:id) # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
    end

    def all_factor_scores
      @all_factor_scores ||= object.users_result.ai_factor_scores.order(:id). # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
                             includes({ factor: :translations }, :versions).to_a
    end

    def active_media_responses_by_question
      @active_media_responses_by_question ||= scorable_questions.to_h do |question| # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
        [question.id, object.users_result.active_media_response(question)]
      end
    end

    def citations_by_question
      @citations_by_question ||= all_factor_scores. # rubocop:disable CustomRubocops/AvoidUsingMemoizationInSerializers
                                 select { |fs| fs.question_id.present? }.
                                 group_by(&:question_id).
                                 transform_values { |scores| scores.flat_map { |s| s.citations || [] } }
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

    def superadmin?
      current_user.is?(:superadmin)
    end
  end
end
