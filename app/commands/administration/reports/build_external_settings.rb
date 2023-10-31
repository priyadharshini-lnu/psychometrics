# frozen_string_literal: true

module Administration
  module Reports
    class BuildExternalSettings < BaseCommand
      private_attr_reader :report, :raw_external_settings, :provider

      def initialize(report, raw_external_settings, provider)
        @report = report
        @provider = provider
        @raw_external_settings = raw_external_settings
      end

      def call
        case provider
          when 'hogan'
            broadcast(:ok, build_hogan)
          when 'saville'
            broadcast(:ok, build_saville)
          when 'pearson'
            broadcast(:ok, build_pearson)
          else
            broadcast(:ok, {})
        end
      end

      private

      def build_hogan
        report_id = raw_external_settings[:report_id]
        settings = Settings.providers.hogan.reports.find { |r| r.id == report_id }
        {
          norm_id: settings.norm_id,
          report_id: report_id,
          language_id: settings.language_id,
          suitability_id: settings.suitability_id
        }
      end

      def build_saville
        { report_id: raw_external_settings[:report_id] }
      end

      def build_pearson
        {}
      end
    end
  end
end
