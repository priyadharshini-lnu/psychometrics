# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class SavilleUsageReportContract < Api::V2::DataReport::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          key.failure(:included_in?, list: ['saville_usage_report']) unless value == 'saville_usage_report'
        end

        rule(data: { attributes: :configuration }) do
          scope = values.dig(:data, :attributes, :scope)
          client_id = values.dig(:data, :relationships, :owner, :data, :id)
          config = parse_configuration(value)
          unless config
            key(:data).failure(I18n.t('admin.invalid_json'))
            next
          end
          project_ids = config['project_ids']
          error = validate_project_ids(project_ids, scope, client_id, required: false)
          key(:data).failure(error) if error
        end
      end
    end
  end
end
