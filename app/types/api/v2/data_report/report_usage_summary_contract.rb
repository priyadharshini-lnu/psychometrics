# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class ReportUsageSummaryContract < Api::V2::DataReport::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          key.failure(:included_in?, list: ['report_usage_summary']) unless value == 'report_usage_summary'
        end

        rule(data: { attributes: :configuration }) do
          scope = values.dig(:data, :attributes, :scope)
          client_id = values.dig(:data, :relationships, :owner, :data, :id)
          config = parse_configuration(value)

          unless config
            key(:data).failure(I18n.t('admin.invalid_json'))
            next
          end

          report_ids = config['report_ids']
          project_ids = config['project_ids']

          error = validate_report_ids(report_ids)
          key(:data).failure(error) if error

          error = validate_project_ids(project_ids, scope, client_id)
          key(:data).failure(error) if error
        end

        private

        def validate_report_ids(report_ids)
          return I18n.t('admin.report_ids_required') if report_ids.blank?

          reports = ::Report.where(id: report_ids)
          return invalid_report_ids_error(report_ids, reports) if reports.count != report_ids.count

          nil
        end

        def invalid_report_ids_error(report_ids, reports)
          invalid_ids = report_ids - reports.pluck(:id)
          I18n.t('admin.invalid_report_ids', ids: invalid_ids.join(', '))
        end
      end
    end
  end
end
