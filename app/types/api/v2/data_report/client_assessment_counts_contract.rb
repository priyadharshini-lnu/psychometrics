# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class ClientAssessmentCountsContract < Api::Base::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          key.failure(:included_in?, list: ['client_assessment_counts']) unless value == 'client_assessment_counts'
        end

        rule(data: { attributes: :configuration }) do
          config = parse_configuration(value)

          unless config
            key(:data).failure(I18n.t('admin.invalid_json'))
            next
          end

          client_ids = config['client_ids']

          error = validate_client_ids(client_ids)
          key(:data).failure(error) if error
        end

        private

        def parse_configuration(value)
          Oj.load(value)
        rescue Oj::ParseError
          nil
        end

        def validate_client_ids(client_ids)
          return nil if client_ids.blank?

          clients = ::Client.roots.where(id: client_ids)
          return invalid_client_ids_error(client_ids, clients) if clients.count != client_ids.count

          nil
        end

        def invalid_client_ids_error(client_ids, clients)
          invalid_ids = client_ids - clients.pluck(:id)
          I18n.t('admin.invalid_client_ids', ids: invalid_ids.join(', '))
        end
      end
    end
  end
end
