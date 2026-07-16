# frozen_string_literal: true

module AdminJobs
  class ExportOccupations < BaseExportCsv
    HEADER_COLUMNS = [
      'Client Name', 'First Name', 'Last Name', 'Email', 'Assessment ID', 'Completed At', 'Assessment', 'Subdomain',
      'Condition set ID'
    ].freeze

    RANK_COLUMNS = %w[
      Rank_1_Name Rank_1_Score Rank_1_Stars
      Rank_2_Name Rank_2_Score Rank_2_Stars
      Rank_3_Name Rank_3_Score Rank_3_Stars
      Rank_4_Name Rank_4_Score Rank_4_Stars
      Rank_5_Name Rank_5_Score Rank_5_Stars
    ].freeze

    def generate_details
      [[I18n.t('admin.occupations'), file_link]]
    end

    def records_for_export
      UserAssessment.
        joins(
          users_result: {},
          campaign: { project: :client },
          assessment: {},
          subject: {}
        ).
        select(
          'users_results.id AS users_result_id',
          'clients.name AS client_name',
          'users.first_name',
          'users.last_name',
          'users.email',
          'user_assessments.assessment_id',
          'user_assessments.completed_at',
          'assessments.name AS assessment',
          'clients.subdomain',
          'users_results.occupation_condition_set_id',
          'users_results.occupations'
        ).
        where(
          clients: { ancestry_depth: 1 },
          assessment_id: assessment.id,
          campaign_id: record.data['campaign_id'],
          user_assessments: { status: 2 }
        ).
        where("users_results.occupations IS NOT NULL AND users_results.occupations != '[]'").
        order('clients.name ASC')
    end

    def data_row(row)
      occupation_scores = row.occupations.map do |score|
        score['name'] = get_occupation_name(score['id'])
        score['stars'] = stars(score['value'] || 0)
        score
      end

      row_values = [
        row.client_name,
        row.first_name,
        row.last_name,
        row.email,
        row.assessment.id,
        row.completed_at,
        row.assessment.name,
        row.subdomain,
        row.occupation_condition_set_id
      ]

      occupations.each do |occ|
        row_values << occupation_scores.find { |score| score['id'] == occ['id'] }&.fetch('value', '')
      end

      sorted_scores = occupation_scores.sort_by { |score| [-score['value'], score['name']] }
      row_values + sorted_scores.first(5).flat_map { |score| [score['name'], score['value'], score['stars']] }
    end

    def headers
      occupation_columns = occupations.pluck(:name)
      [HEADER_COLUMNS + occupation_columns + RANK_COLUMNS]
    end

    def file_name
      "assessment-#{assessment.id}-occupations-#{Time.zone.now.strftime('%Y-%m-%dT%H%M%S')}.csv"
    end

    private

    def assessment
      @assessment ||= Assessment.find(record.data['assessment_id'])
    end

    def occupations
      @occupations ||= Occupation.where(dimension_id: dimension_id)
    end

    def dimension_id
      assessment.dimension_id
    end

    def get_occupation_name(id)
      occupations.find_by(id: id)&.name
    end

    def stars(value)
      Occupations::CalculateStars.call!(value)
    end
  end
end
