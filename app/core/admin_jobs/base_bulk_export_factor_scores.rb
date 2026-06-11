# frozen_string_literal: true

module AdminJobs
  class BaseBulkExportFactorScores < BaseExportXlsx
    def call
      all_assessment_ids = grouped_assessments.values.flatten.map(&:id)

      unless records_for_export(all_assessment_ids).exists?
        job_record.complete!([I18n.t('admin.bulk_assessment_download_no_data_found')])
        return broadcast :ok
      end

      super
    end

    private

    def xlsx
      package = Axlsx::Package.new
      workbook = package.workbook

      grouped_assessments.each do |dimension, assessments|
        factors = factors_by_dimension[dimension.id]
        worksheet_name = safe_sheet_name("Dimension - #{dimension.name}")

        workbook.add_worksheet(name: worksheet_name) do |sheet|
          sheet.add_row(headers(factors))

          assessments.sort_by(&:id).each do |assessment|
            records_for_export([assessment.id]).find_each(batch_size: 100) do |user_result|
              sheet.add_row(data_row(user_result, factors))
            end
          end
        end
      end

      package
    end

    def headers(factors)
      [
        'Assessment ID', 'Assessment Name',
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Score Calculated At', *extra_headers,
        'Status', *factors.map(&:name)
      ]
    end

    def data_row(user_result, factors)
      score_values = factors.map do |factor|
        user_result.scoring&.dig(factor.id.to_s, score_field)
      end

      [
        user_result.user_assessment.assessment_id,
        user_result.user_assessment.assessment.name,
        user_result.encoded_id,
        user_name(user_result.subject.first_name, user_result.subject.last_name),
        user_result.subject.email,
        user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
        user_result.evaluator.email,
        user_result.user_assessment.relationship&.name,
        user_result.user_assessment.started_at.to_s,
        user_result.completed_at.to_s,
        user_result.user_assessment.score_calculated_at.to_s,
        *extra_data(user_result),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        *score_values
      ]
    end

    def records_for_export(assessment_ids)
      users_results = UsersResult.joins(:user_assessment).
                      where(user_assessments: { assessment_id: assessment_ids, campaign_id: campaign.id }).
                      where(user_assessments: { completed_at: start_date..end_date }).
                      merge(UserAssessment.scored).
                      includes(:norm, :subject, :evaluator, user_assessment: %i[relationship assessment])

      unless include_inactive_users
        users_results = users_results.joins(
          <<~SQL.squish
            INNER JOIN campaign_users ON campaign_users.user_id = user_assessments.subject_id
            AND campaign_users.campaign_id = user_assessments.campaign_id
          SQL
        ).where(campaign_users: { active: true })
      end

      users_results
    end

    def grouped_assessments
      @grouped_assessments ||= selected_assessments.group_by(&:dimension).reject { |dimension, _| dimension.blank? }
    end

    def factors_by_dimension
      @factors_by_dimension ||= grouped_assessments.keys.to_h do |dimension|
        [dimension.id, dimension.all_factors.active.select(:id, :name).to_a]
      end
    end

    def selected_assessments
      @selected_assessments ||= campaign.assessments.includes(:dimension).where(id: record.data['assessment_ids'])
    end

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end

    def start_date
      @start_date ||= Time.zone.parse(record.data['start_date'].to_s)
    end

    def end_date
      @end_date ||= Time.zone.parse(record.data['end_date'].to_s)
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end

    def safe_sheet_name(name)
      sanitized = name.to_s.gsub(%r{[\[\]\*\?/\\:]}, ' ').squish
      sanitized.first(31)
    end

    def user_name(first_name, last_name)
      [first_name, last_name].compact_blank.join(', ')
    end

    def file_name
      formatted_start_date = start_date&.to_date&.iso8601 || Time.zone.today.iso8601
      formatted_end_date = end_date&.to_date&.iso8601 || Time.zone.today.iso8601
      formatted_date_range = "#{formatted_start_date}_to_#{formatted_end_date}"

      "bulk_assessments_campaign_id_#{campaign.id}_#{export_file_key}_#{formatted_date_range}.xlsx"
    end

    def export_file_key
      raise NoMethodError, 'Define export_file_key in subclass'
    end

    def extra_headers
      []
    end

    def extra_data(_user_result)
      []
    end

    def score_field
      raise NoMethodError, 'Define score_field in subclass'
    end
  end
end
