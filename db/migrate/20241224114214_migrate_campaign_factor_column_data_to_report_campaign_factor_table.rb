# frozen_string_literal: true

# rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
class MigrateCampaignFactorColumnDataToReportCampaignFactorTable < ActiveRecord::Migration[7.1]
  def up
    if column_exists?(:reports, :campaign_factors)
      report_campaign_factors = []

      Report.where.not("campaign_factors::text = '[]'").find_each do |report|
        campaign_factors_data = report.read_attribute(:campaign_factors) || []

        campaign_factors_data.each do |campaign_factor|
          report_campaign_factors << {
            code: campaign_factor['code'],
            name: campaign_factor['name'],
            output_type: campaign_factor['outputType'],
            report_id: report.id
          }
        end
      end

      report_campaign_factors.reverse!.uniq! { |cf| [cf[:report_id], cf[:code]] }
      report_campaign_factors.reverse!

      Reports::CampaignFactor.import(
        %i[code name output_type report_id],
        report_campaign_factors,
        on_duplicate_key_update: {
          conflict_target: %i[report_id code],
          columns: %i[name output_type]
        }
      )
    else
      Rails.logger.warn "Skipping migration: 'campaign_factors' column does not exist on 'reports' table."
    end
  end
end
# rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
