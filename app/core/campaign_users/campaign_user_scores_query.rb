# frozen_string_literal: true

module CampaignUsers
  class CampaignUserScoresQuery < Rectify::Query
    private_attr_reader :campaign_id, :sort, :limit, :offset, :search_term, :campaign_user_ids,
                        :campaign_users_active_in

    def initialize(campaign_id:, campaign_user_ids: [], sort: { field: 'email', direction: :asc }, filter: {})
      @campaign_id = campaign_id
      @search_term = filter[:search_term]
      @campaign_user_ids = campaign_user_ids
      @sort = sort
      @limit = (filter[:limit] || 25).to_i
      @offset = (filter[:offset] || 0).to_i
      campaign_users_active_in = filter[:campaign_users_active_in]
      @campaign_users_active_in =
        if campaign_users_active_in.is_a?(Array)
          campaign_users_active_in.join(',')
        else
          campaign_users_active_in || 'true'
        end
    end

    def query
      ActiveRecord::Base.connection.execute(ApplicationRecord.sanitize_sql([sql, params]))
    end

    private

    def sql
      factor_columns = dynamic_factor_columns
      rank_column = find_rank_by_column
      ranking_sql = if rank_column
                      <<~SQL.squish
                        CASE
                          WHEN (ct."#{rank_column}"::json->>'value') IS NOT NULL THEN
                            RANK() OVER (ORDER BY (ct."#{rank_column}"::json->>'value')::float DESC NULLS LAST)
                        END as stack_rank,
                      SQL
                    else
                      ''
                    end
      base_query = <<~SQL.squish
        SELECT
          cu.id,
          cu.active,
          cu.campaign_scores_calculated_date,
          cu.campaign_scores_errors,
          cu.campaign_scores_finalized,
          cu.campaign_scores_finalized_date,
          cu.campaign_id,
          u.id as user_id,
          u.email,
          u.first_name,
          u.last_name,
          #{ranking_sql}
      SQL
      base_query += "#{'ct.*,' unless factor_columns.empty?} cu.user_id FROM campaign_users cu
      JOIN users u ON cu.user_id = u.id "
      if factor_columns.present?
        base_query += "LEFT JOIN (#{crosstab_query}) AS ct ON cu.user_id = ct.user_id "
      end
      base_query += "WHERE cu.active IN (#{campaign_users_active_in})"
      base_query += " AND cu.campaign_id = #{campaign_id} #{search_condition}"
      base_query += ' AND u.is_uat = FALSE'
      base_query += " AND cu.id in(#{campaign_user_ids.join(',')})" if campaign_user_ids.present?
      base_query += sort_condition
      base_query += " LIMIT #{limit} OFFSET #{offset};"
      base_query
    end

    def crosstab_query
      factor_columns = dynamic_factor_columns
      if factor_columns.empty?
        ''
      else
        <<~SQL.squish
          SELECT * FROM crosstab(
            $$SELECT cu.user_id, cfv.campaign_factor_id,
              CASE
                WHEN cf.output_type = 0 THEN json_build_object('value', cfv.numeric_value, 'label', cfv.label)
                ELSE json_build_object('value', cfv.string_value, 'label', cfv.label)
              END
             FROM campaign_users cu
             JOIN campaign_factor_values cfv ON cu.campaign_id = cfv.campaign_id AND cu.user_id = cfv.user_id
             JOIN campaign_factors cf ON cfv.campaign_factor_id = cf.id
             WHERE cu.campaign_id = #{campaign_id}
             ORDER BY 1,2$$,
             '#{campaign_factor_ids_query.to_sql}'
          ) AS final_result(user_id INT, #{dynamic_factor_columns})
        SQL
      end
    end

    def sort_condition
      sanitized_sort_column = ActiveRecord::Base.connection.quote_column_name(sort[:field])

      if campaign_factor_ids.include?(sort[:field].to_i) && campaign_factor_types[sort[:field].to_i] == 'numeric'
        " ORDER BY (#{sanitized_sort_column}::json->>'value')::float #{sort[:direction]}"
      elsif campaign_factor_ids.include?(sort[:field].to_i) && campaign_factor_types[sort[:field].to_i] == 'string'
        " ORDER BY (#{sanitized_sort_column}::json->>'value')::text #{sort[:direction]}"
      else
        " ORDER BY #{sanitized_sort_column} #{sort[:direction]}"
      end
    end

    def campaign_factor_ids_query
      CampaignFactor.where(campaign_id: campaign_id).select(:id).distinct.order(:id)
    end

    def campaign_factor_ids
      @campaign_factor_ids ||= campaign_factor_ids_query.pluck(:id)
    end

    def campaign_factor_types
      @campaign_factor_types ||= campaign_factor_ids_query.pluck(:id, :output_type).to_h
    end

    def dynamic_factor_columns
      factor_ids = campaign_factor_ids
      factor_ids.map { |id| "\"#{id}\" JSON" }.join(', ')
    end

    def params
      {
        campaign_id: campaign_id,
        sort: sort
      }
    end

    def find_rank_by_column
      rank_by_factor = CampaignFactor.find_by(campaign_id: campaign_id, ranked: true)
      rank_by_factor&.id&.to_s
    end

    def search_condition
      return '' if @search_term.nil?

      sanitized_search_term = ActiveRecord::Base.connection.quote("%#{@search_term}%")
      "AND (u.email ILIKE #{sanitized_search_term} OR u.id::text ILIKE #{sanitized_search_term})"
    end
  end
end
