# frozen_string_literal: true

module Reports
  class BuildSnapshotData < BaseCommand
    REPORT_SNAPSHOT_COLUMNS = %w[props styles data_configuration data_sheet_columns external_settings].freeze

    private_attr_reader :report

    def initialize(report)
      @report = report
    end

    def call
      broadcast :ok, snapshot_hash
    end

    private

    def snapshot_hash
      {
        'report' => report.attributes.slice(*REPORT_SNAPSHOT_COLUMNS),
        'pages' => pages_data,
        'filters' => report.filters.map(&:attributes),
        'campaign_factors' => report.campaign_factors.map(&:attributes),
        'campaign_ai_artifacts' => report.campaign_ai_artifacts.map(&:attributes)
      }
    end

    def pages_data
      report.pages.map do |page|
        page.attributes.merge('modules' => page.modules.order(:id).map(&:attributes))
      end
    end
  end
end
