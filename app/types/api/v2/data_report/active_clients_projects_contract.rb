# frozen_string_literal: true

module Api
  module V2
    module DataReport
      class ActiveClientsProjectsContract < Api::Base::Contract
        rule(data: { attributes: :report_type }) do
          next unless value

          key.failure(:included_in?, list: ['active_clients_projects']) unless value == 'active_clients_projects'
        end

        rule(data: { attributes: :configuration }) do
          config = parse_configuration(value)

          unless config
            key(:data).failure(I18n.t('admin.invalid_json'))
            next
          end

          if config['start_date'].blank? || config['end_date'].blank?
            key(:data).failure(I18n.t('admin.date_range_required'))
          end
        end

        private

        def parse_configuration(value)
          Oj.load(value)
        rescue Oj::ParseError
          nil
        end
      end
    end
  end
end
