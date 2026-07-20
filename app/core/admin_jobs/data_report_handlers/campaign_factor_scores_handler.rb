# frozen_string_literal: true

module AdminJobs
  module DataReportHandlers
    class CampaignFactorScoresHandler < BaseHandler
      HEADERS = [
        'Client ID',
        'Client Name',
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
        'User ID',
        'Email',
        'CF Group',
        'CF Name',
        'CF Code',
        'CF Numeric',
        'CF String',
        'Score Finalized Date'
      ].freeze

      def generate_file
        CSV.open(file_path, 'wb') do |csv|
          csv << HEADERS
          fetch_data.each do |row|
            csv << format_csv_row(row)
          end
        end
      end

      def self.file_extension
        'csv'
      end

      private

      def fetch_data
        records = CampaignFactorValue.
                  joins('LEFT JOIN campaign_factors cf ON cfv.campaign_factor_id = cf.id').
                  joins('LEFT JOIN campaign_factor_groups cfg ON cfg.id = cf.campaign_factor_group_id').
                  joins('LEFT JOIN campaigns c ON c.id = cf.campaign_id').
                  joins('LEFT JOIN campaign_users cu ON cu.campaign_id = c.id AND cu.user_id = cfv.user_id').
                  joins('LEFT JOIN clients p ON p.id = c.project_id').
                  joins('LEFT JOIN clients cl ON cl.id = p.tte_id').
                  joins('LEFT JOIN users u ON u.id = cfv.user_id').
                  from('campaign_factor_values cfv').
                  where('p.ancestry_depth = ? AND cl.ancestry_depth = ?', 1, 0).
                  where(cu: { campaign_scores_finalized: true })

        records = records.where(p: { id: project_ids }) if project_ids.present?

        records.
          order('cl.id, p.id, c.id, u.id, cfg.name, cf.name').
          pluck(
            'cl.id',
            'cl.name',
            'p.id',
            'p.name',
            'c.id',
            'c.name',
            'u.id',
            'u.email',
            'cfg.name',
            'cf.name',
            'cf.code',
            'cfv.numeric_value',
            'cfv.string_value',
            'cu.campaign_scores_finalized_date'
          )
      end
    end
  end
end
