# frozen_string_literal: true

module AI
  module ContentAnalysis
    class SaveAIFactorScores < BaseCommand # rubocop:disable Metrics/ClassLength
      include Concerns::ScoringHelper
      include AdminJobs::Concerns::Syncable

      private_attr_reader :users_result, :assessment, :user_assessment, :rescore, :admin_job_record_id

      def initialize(users_result, rescore: false, admin_job_record_id: nil)
        @users_result = users_result
        @assessment = users_result.assessment
        @user_assessment = users_result.user_assessment
        @rescore = rescore
        @admin_job_record_id = admin_job_record_id
      end

      def call
        if sessions.empty?
          complete_admin_job!
          return broadcast :ok
        end

        ActiveRecord::Base.transaction do
          full_scoring_map.each do |factor_id, data|
            question_ids = factor_question_map[factor_id.to_s] || []
            persist_factor_scores(factor_id, data, question_ids)
          end

          cleanup_abandoned_factor_scores!
        end

        complete_admin_job!
        notify_assessors_if_pending!
        merge_scores_if_no_approval_flow!

        broadcast :ok
      rescue StandardError => e
        users_result.update!(ai_scoring_status: :failed)
        fail_admin_job!(["Failed to save AI scores for UsersResult #{users_result.id}: #{e.message}"])
        broadcast(:error, "Failed to save AI scores: #{e.message}")
      end

      private

      def sessions
        @sessions ||= AI::QuestionScoringSession.where(
          resource: users_result.user_assessment,
          assistable_type: 'Question',
          assistable_id: scorable_question_ids,
          status: :completed
        ).includes(:question)
      end

      def factor_ids_scope
        factor_ids = ai_scored_factors_by_id.keys
        @factor_ids_scope ||= (factor_ids + determine_all_ancestors(factor_ids)).uniq
      end

      def question_scores_map
        map = Hash.new { |h, k| h[k] = { 'results' => [] } }

        sessions.each do |session|
          session.scores.to_h.each do |factor_id, data|
            factor = ai_scored_factors_by_id[factor_id.to_i]
            next unless factor

            score = effective_score_for_scoring_map(
              factor_id: factor_id.to_i,
              question_id: session.assistable_id,
              ai_score: data['score'].to_f
            )

            map[factor_id]['results'] << {
              'value' => score,
              'question_id' => session.assistable_id,
              'max_value' => factor.score_max || 5.0,
              'value_sum' => score,
              'ai_metadata' => {
                'confidence' => data['confidence'],
                'citations' => data['citations'],
                'rationale' => data['rationale']
              }
            }
          end
        end

        map
      end

      def effective_score_for_scoring_map(factor_id:, question_id:, ai_score:)
        existing_score = existing_ai_scores_by_pair[[factor_id, question_id]]
        return ai_score unless existing_score
        return ai_score if existing_score.override_score.nil? && !existing_score.not_applicable?

        existing_score.final_score.to_f
      end

      def existing_ai_scores_by_pair
        @existing_ai_scores_by_pair ||= AI::FactorScore.
                                        where(
                                          users_result: users_result,
                                          factor_id: ai_scored_factors_by_id.keys,
                                          question_id: scorable_question_ids,
                                          scoring_type: :ai
                                        ).
                                        index_by { |record| [record.factor_id, record.question_id] }
      end

      def ai_scored_factors_by_id
        @ai_scored_factors_by_id ||= begin
          factor_ids = sessions.flat_map { |s| s.scores.to_h.keys }.map(&:to_i).uniq
          Factor.where(id: factor_ids).index_by(&:id)
        end
      end

      def full_scoring_map
        @full_scoring_map ||= calculate_extended_scoring(question_scores_map, factor_ids_scope)
      end

      def factor_question_map
        sessions.each_with_object(Hash.new { |h, k| h[k] = [] }) do |session, map|
          session.scores.to_h.each_key do |factor_id|
            map[factor_id.to_s] << session.assistable_id
          end
        end
      end

      def ai_score_pairs
        @ai_score_pairs ||= question_scores_map.each_with_object([]) do |(factor_id, data), pairs|
          (data['results'] || []).each do |result|
            next if result['question_id'].blank?

            pairs << [factor_id.to_i, result['question_id'].to_i]
          end
        end.uniq
      end

      def persist_factor_scores(factor_id, data, question_ids)
        if question_ids.any?
          factor = factors_by_id[factor_id.to_i]
          parent_factor_id = factor&.parent_factors&.first&.id
          persist_with_question_details(factor_id, data, question_ids, parent_factor_id)
          return if parent_factor_id
        end
        persist_aggregated_score(factor_id, data['score'])
      end

      def persist_with_question_details(factor_id, data, question_ids, parent_factor_id)
        results = data['results'] || []

        results.each do |result|
          question_id = result['question_id']
          next unless question_ids.include?(question_id)

          ai_metadata = result['ai_metadata'] || {}
          citations = enrich_citations_with_timestamps(ai_metadata['citations'], question_id)

          upsert_factor_score(
            factor_id: factor_id,
            question_id: question_id,
            score: result['value'],
            confidence: ai_metadata['confidence'],
            citations: citations,
            rationale: ai_metadata['rationale'],
            parent_factor_id: parent_factor_id,
            scoring_type: :ai
          )
        end
      end

      def enrich_citations_with_timestamps(citations, question_id)
        return citations if citations.blank?

        media_response = questions_with_media_response[question_id]
        return citations if media_response.blank?

        segments = media_response.transcription&.segments
        return citations if segments.blank?

        CitationTimestampMatcher.call(citations, segments)
      end

      def questions_with_media_response
        @questions_with_media_response ||= begin
          questions = assessment.questions.where(id: scorable_question_ids).to_a

          questions.to_h do |question|
            [question.id, users_result.active_media_response(question)]
          end
        end
      end

      def persist_aggregated_score(factor_id, score_value)
        upsert_factor_score(
          factor_id: factor_id,
          question_id: nil,
          score: score_value,
          confidence: nil,
          citations: nil,
          rationale: nil,
          parent_factor_id: nil,
          scoring_type: :aggregated
        )
      end

      def cleanup_abandoned_factor_scores!
        cleanup_abandoned_ai_scores!
        cleanup_abandoned_aggregated_scores!
      end

      def cleanup_abandoned_ai_scores!
        scope = users_result.ai_factor_scores.scoring_type_ai
        return scope.delete_all if ai_score_pairs.empty?

        pair_predicate = ai_score_pairs.map { '(factor_id = ? AND question_id = ?)' }.join(' OR ')
        valid_scope = scope.where(pair_predicate, *ai_score_pairs.flatten)
        scope.where.not(id: valid_scope.select(:id)).delete_all
      end

      def cleanup_abandoned_aggregated_scores!
        scope = users_result.ai_factor_scores.scoring_type_aggregated
        valid_factor_ids = aggregated_factor_ids

        return scope.delete_all if valid_factor_ids.empty?

        scope.where.not(factor_id: valid_factor_ids).delete_all
      end

      def aggregated_factor_ids
        @aggregated_factor_ids ||= full_scoring_map.keys.map(&:to_i).reject do |factor_id|
          factors_by_id[factor_id]&.parent_factors&.first.present?
        end
      end

      def factors_by_id
        @factors_by_id ||= Factor.
                           where(id: factor_ids_scope).
                           includes(:parent_factors).
                           index_by(&:id)
      end

      def scorable_question_ids
        @scorable_question_ids ||= assessment.scorable_ai_questions.pluck(:id)
      end

      def notify_assessors_if_pending!
        return unless user_assessment.has_ai_scoring_approval_flow?
        return unless user_assessment.approval_status == 'pending'
        return if score_approval.setting&.do_not_send_notifications?
        return if rescore

        ::ScoreApprovals::NotifyAssessors.call!(score_approval)
      end

      def score_approval
        @score_approval ||= AI::ScoreApproval.find(user_assessment.id)
      end

      def merge_scores_if_no_approval_flow!
        return if user_assessment.has_ai_scoring_approval_flow?

        user_assessment.auto_approve_scoring!
        UsersResults::Scoring::MergeAIScores.call!(users_result, rescore: rescore)
      end
    end
  end
end
