# frozen_string_literal: true

module AdminJobs
  class ExportCampaignAIArtifactsResultsJob < BaseExportCsv
    def generate_details
      [[I18n.t('admin.campaign_ai_artifacts_results_export_details'), file_link]]
    end

    private

    def headers
      column_headers = [
        'User ID',
        'Email',
        'First Name',
        'Last Name'
      ] + campaign_artifacts_keys.map { |artifact| artifact[:keys].map { |key| "#{artifact[:code]}.#{key}" } }.flatten
      column_headers + [
        'Generated At'
      ]
    end

    def campaign_artifacts_keys
      @campaign_artifacts_keys ||= campaign_artifacts.map do |artifact|
        {
          id: artifact.id,
          code: artifact.code,
          keys: artifact.assistant_output_schema_keys.map(&:key)
        }
      end
    end

    def campaign_artifacts
      @campaign_artifacts ||= campaign.campaign_ai_artifacts.order(:created_at).includes(:assistant_output_schema_keys)
    end

    def write_csv
      job_record.update(total_tasks: record_count)
      CsvUtf8.write(file_path) do |csv|
        write_csv_headers(csv)
        max_count = campaign.campaign_users.count
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
      end
    end

    def data_row(user_artifacts_results)
      row = [
        user_artifacts_results['user_id'],
        user_artifacts_results['email'],
        user_artifacts_results['first_name'],
        user_artifacts_results['last_name']
      ] + user_artifacts_results['generated_artifacts_results']

      row + [
        user_artifacts_results['generated_at']
      ]
    end

    def records_for_export(limit = 100, offset = 0)
      batch_users = users.limit(limit).offset(offset).to_a
      return [] if batch_users.empty?

      user_ids = batch_users.map(&:id)
      artifact_ids = campaign_artifacts.map(&:id)

      results_by_user_and_artifact = AI::CampaignArtifactResult.
                                     where(user_id: user_ids,
                                           assistable_type: 'AI::CampaignArtifact',
                                           assistable_id: artifact_ids).
                                     index_by { |r| [r.user_id, r.assistable_id] }

      batch_users.map do |user|
        user_artifact_results = campaign_artifact_results_for_user(user, results_by_user_and_artifact)
        generated_results = user_artifact_results.map { |artifact_result| artifact_result['checkpoint_values'] }
        generated_at = user_artifact_results.filter_map { |res| res['generated_at'] }.max

        {
          'user_id' => user.id,
          'email' => user.email,
          'first_name' => user.first_name,
          'last_name' => user.last_name,
          'generated_artifacts_results' => generated_results.flatten,
          'generated_at' => generated_at
        }
      end
    end

    def users
      return campaign.users.none if campaign_artifacts.empty?

      campaign.users.order(:id)
    end

    def record_count
      @record_count ||= users.count
    end

    def campaign_artifact_results_for_user(user, results_by_user_and_artifact)
      campaign_artifacts.map do |artifact|
        artifact_results = results_by_user_and_artifact[[user.id, artifact.id]]
        generated_checkpoint = artifact_results&.checkpoint || {}
        {
          'checkpoint_values' => artifact_results_value(artifact, generated_checkpoint),
          'generated_at' => artifact_results&.updated_at
        }
      end
    end

    def artifact_results_value(artifact, generated_checkpoint)
      campaign_artifacts_keys.find { |a| a[:id] == artifact.id }[:keys].map do |key|
        generated_checkpoint[key] || 'N/A'
      end
    end

    def file_name
      'campaign_ai_artifacts_results.csv'
    end
  end
end
