# frozen_string_literal: true

module AdminJobs
  class AssessmentRawAIFactorExport < BaseExportAssessment
    def headers
      factor_names = ordered_factors.map(&:name)
      ['Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
       'Relationship', 'Started At', 'Completed At', 'Score Calculated At', 'Status',
       'AI Scoring Status', 'Approval Status', 'Approval Status Updated At', 'Score Assessed By',
       'Score Approved By', 'Score Assessed At', 'Score Approved At', *factor_names]
    end

    def data_row(user_result)
      ua = user_result.user_assessment
      factor_scores = scores_by_factor_id(user_result)
      ai_scores = ordered_factors.map { |factor| factor_scores[factor.id] }

      [
        user_result.encoded_id,
        user_name(user_result.subject.first_name, user_result.subject.last_name),
        user_result.subject.email,
        user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
        user_result.evaluator.email,
        ua.relationship&.name,
        user_result.created_at.to_s,
        user_result.completed_at.to_s,
        ua.score_calculated_at.to_s,
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        user_result.ai_scoring_status,
        ua.approval_status,
        ua.approval_status_updated_at,
        user_name(ua.score_assessed_by&.first_name, ua.score_assessed_by&.last_name),
        user_name(ua.score_approved_by&.first_name, ua.score_approved_by&.last_name),
        ua.score_assessed_at,
        ua.score_approved_at,
        *ai_scores
      ]
    end

    def records_for_export
      users_results = UsersResult.joins(:user_assessment).
                      where(user_assessments: { assessment_id: assessment.id, campaign_id: campaign.id,
                                                status: UserAssessment::DEEMED_COMPLETED_STATUS }).
                      where.not(ai_scoring_status: nil).
                      includes(:norm, :subject, :evaluator, :ai_factor_scores,
                               user_assessment: [
                                 :relationship,
                                 { score_assessed_by: [], score_approved_by: [] }
                               ])

      users_results = filter_active_campaign_users(users_results) unless include_inactive_users

      users_results.find_each(batch_size: 100)
    end

    def ordered_factors
      @ordered_factors ||= build_ordered_factors
    end

    private

    def build_ordered_factors
      all_factors = assessment.dimension.all_factors.active.includes(:sub_factors, :parent_factors).to_a.sort_by(&:id)
      ordered = []
      processed = Set.new

      all_factors.select { |factor| factor.sub_factors.any? }.sort_by(&:id).each do |factor|
        next if processed.include?(factor.id)

        add_factor_with_children(factor, ordered, processed)
      end

      all_factors.each do |factor|
        next if processed.include?(factor.id)

        ordered << factor
        processed.add(factor.id)
      end

      ordered
    end

    def add_factor_with_children(factor, ordered, processed)
      ordered << factor
      processed.add(factor.id)

      factor.sub_factors.sort_by(&:id).each do |sub_factor|
        next if processed.include?(sub_factor.id)

        ordered << sub_factor
        processed.add(sub_factor.id)
      end
    end

    def filter_active_campaign_users(users_results)
      users_results.joins(
        'INNER JOIN campaign_users ON campaign_users.user_id = user_assessments.subject_id ' \
        'AND campaign_users.campaign_id = user_assessments.campaign_id'
      ).where(campaign_users: { active: true })
    end

    def scores_by_factor_id(user_result)
      aggregated_scores = {}

      user_result.ai_factor_scores.each do |record|
        aggregated_scores[record.factor_id] = record.final_score if record.scoring_type_aggregated?
      end

      child_scoring_map = build_child_scoring_map(user_result)
      child_scores = compute_child_scores_by_strategy(user_result, child_scoring_map)

      ordered_factors.each_with_object({}) do |factor, scores|
        aggregated_score = aggregated_scores[factor.id]
        if aggregated_score.present?
          scores[factor.id] = aggregated_score
          next
        end

        next unless factor.parent_factors.any?

        scores[factor.id] = child_scores[factor.id]
      end
    end

    def build_child_scoring_map(user_result)
      factor_by_id = ordered_factors.index_by(&:id)

      user_result.ai_factor_scores.each_with_object(Hash.new { |h, k| h[k] = { 'results' => [] } }) do |record, map|
        next unless record.scoring_type_ai? && record.question_id

        factor = factor_by_id[record.factor_id]
        next unless factor&.parent_factors&.any?

        map[record.factor_id.to_s]['results'] << {
          'value' => record.final_score.to_f,
          'question_id' => record.question_id,
          'max_value' => factor.score_max || 5.0,
          'value_sum' => record.final_score.to_f
        }
      end
    end

    def compute_child_scores_by_strategy(user_result, child_scoring_map)
      return {} if child_scoring_map.empty?

      extended_scoring = ::UsersResults::Scoring::Extend.call!(
        dimension: user_result.assessment.dimension,
        scoring: child_scoring_map,
        norm_data: user_result.norm_data,
        answers: user_result.answers,
        factors_scope: child_factors_scope
      )

      extended_scoring.each_with_object({}) do |(factor_id_str, data), scores|
        score = data['score']
        scores[factor_id_str.to_i] = score if score.present?
      end
    end

    def child_factors_scope
      @child_factors_scope ||= Factor.where(id: ordered_factors.select { |f| f.parent_factors.any? }.map(&:id))
    end

    def file_name
      "assessment-#{assessment.id}-ai-factor-scores.csv"
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end
  end
end
