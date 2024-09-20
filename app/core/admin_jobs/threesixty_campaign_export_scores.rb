# frozen_string_literal: true

module AdminJobs
  class ThreesixtyCampaignExportScores < BaseExportCsv
    FIXED_HEADERS = ['Id', 'First Name', 'Last Name', 'Email'].freeze

    def valid?
      campaign.present?
    end

    def generate_details
      [[I18n.t('common.model.threesixty_campaign'), file_link]]
    end

    private

    def headers
      factor_columns = factor_by_id.flat_map { |_id, factor_name| [factor_name] * relationship_hash.length }
      factors_header = FIXED_HEADERS + factor_columns
      relationship_header = Array.new(FIXED_HEADERS.length, '') +
                            (relationship_hash.values * factor_by_id.length)

      [factors_header, relationship_header]
    end

    def records_for_export
      UserAssessment.joins(:users_result, :subject, :evaluator, :relationship).
        select('users_results.id', 'users.first_name',
               'users.last_name',
               'users.email', 'relationships.id AS relationship_id', :scoring).
        where(campaign_id: campaign.id).
        where('relationships.campaign_id = ? OR relationships.campaign_id IS NULL', campaign.id).
        where(status: :completed).
        order('users.email ASC').group_by(&:email)
    end

    def record_count
      records_for_export.count(:id)
    end

    def data_row(email_and_user_assessments)
      user_assessments = email_and_user_assessments.second
      row_values = initialize_row_values(user_assessments)
      scores_by_factor_relationships = initialize_scores_hash(factor_by_id, relationship_hash)

      calculate_scores(user_assessments, factor_by_id, scores_by_factor_relationships, factor_by_id)

      append_row_values(row_values, factor_by_id, relationship_hash,
                        scores_by_factor_relationships)
      [
        *row_values
      ]
    end

    def initialize_row_values(user_assessments)
      user_assessments.first.attributes.except('relationship_id', 'scoring').values
    end

    def initialize_scores_hash(factors, relationships)
      factors.transform_values do |_factor_name|
        relationships.keys.index_with { |_r| [] }
      end
    end

    # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    def calculate_scores(user_assessments, factors, scores_by_factor_relationships, factors_by_id)
      user_assessments.group_by { |user_assessment| user_assessment['relationship_id'] }.each do |relationship_id, rows|
        rows.each do |row|
          factor_scores = row.scoring.filter_map do |factor_id, score|
            factors_by_id[factor_id.to_i] && score.present? && {
              id: factor_id, name: factors_by_id[factor_id.to_i],
              score: score['score']
            }
          end

          factors.each do |id, _factor_name|
            collected_score = factor_scores.find do |score|
              score[:id] == id.to_s
            end&.fetch(:score, nil)

            next unless collected_score

            scores_by_factor_relationships[id][relationship_id].push(collected_score)
            if relationship_hash[relationship_id] != 'Self'
              scores_by_factor_relationships[id][:others].push(collected_score)
            end
          end
        end
      end
    end
    # rubocop:enable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

    def append_row_values(row_values, factors, relationships, scores_by_factor_relationships)
      factors.each do |id, _factor_name|
        relationships.each do |relationship_id, _relationship|
          collected_scores = scores_by_factor_relationships[id][relationship_id]
          average_score = collected_scores.sum / collected_scores.size.to_f if collected_scores.any?
          row_values << (average_score&.round(2) || '')
        end
      end
      row_values
    end

    def factor_by_id
      @factor_by_id ||= campaign.threesixty_campaign.assessment.dimension.all_factors.pluck(:id, :name).to_h
    end

    def relationship_hash
      @relationship_hash ||= campaign.threesixty_campaign.available_relationships.pluck(:id, :name).
                             sort.to_h.merge({ :others => 'Others (All Except Self)' })
    end

    def file_name
      "Threesixty-Campaign-Scores-#{campaign.id}.csv"
    end
  end
end
