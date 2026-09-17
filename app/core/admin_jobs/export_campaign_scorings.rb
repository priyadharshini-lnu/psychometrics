# frozen_string_literal: true

module AdminJobs
  class ExportCampaignScorings < BaseExportCsv
    def generate_details
      [[I18n.t('administration.scoring.export.details'), file_link]]
    end

    private

    def headers
      column_headers = [
        'User ID',
        'Email',
        'First Name',
        'Last Name'
      ] + campaign_factors.map(&:name)
      column_headers << 'Rank' if rank_by_column_exist
      column_headers + [
        'Calculated Date',
        'Finalized Date',
        'Finalized'
      ]
    end

    def campaign_factors
      @campaign.campaign_factor_groups.order(:position).includes(:campaign_factors).map do |group|
        group.campaign_factors.sort_by(&:position)
      end.flatten
    end

    def write_csv
      job_record.update(total_tasks: record_count)
      CsvUtf8.write(file_path) do |csv|
        write_csv_headers(csv)
        max_count = campaign.campaign_users.joins(:user).where(users: { is_uat: false }).count
        limit = 100
        iterations = (max_count / limit) + 1
        iterations.times do |iteration|
          offset = iteration * limit
          records_for_export(limit, offset).each_with_index do |record, index|
            csv << data_row(record)

            record_count = index + 1
            if (record_count % flush_threshold).zero?
              csv.flush
              job_record.update!(completed_tasks: record_count)
            end
          end
        end
        job_record.complete!
      end
    end

    def data_row(score)
      row = [
        score['user_id'],
        score['email'],
        score['first_name'],
        score['last_name']
      ]
      row += campaign_factors.map do |cf|
        factor_value = score[cf.id.to_s]
        factor_value.present? ? JSON.parse(factor_value)['value'] : nil
      end
      row << score['stack_rank'] if rank_by_column_exist
      row + [
        score['campaign_scores_calculated_date'],
        score['campaign_scores_finalized_date'],
        score['campaign_scores_finalized']
      ]
    end

    def records_for_export(limit = 100, offset = 0)
      CampaignUsers::CampaignUserScoresQuery.new(
        campaign_id: campaign.id,
        filter: {
          limit: limit,
          offset: offset,
          ** record.data['filters']
        }.with_indifferent_access
      ).query
    end

    def rank_by_column_exist
      @rank_by_column_exist ||= CampaignFactor.exists?(campaign_id: campaign.id, ranked: true)
    end

    def file_name
      'campaign_scorings.csv'
    end
  end
end
