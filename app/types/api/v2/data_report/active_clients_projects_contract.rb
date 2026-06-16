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

          activity_period = config['activity_period']

          if activity_period.blank? || !activity_period.is_a?(Array) || activity_period.size != 2 ||
             activity_period[0].blank? || activity_period[1].blank?
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
