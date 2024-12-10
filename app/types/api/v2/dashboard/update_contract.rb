# frozen_string_literal: true

module Api
  module V2
    module Dashboard
      class UpdateContract < Api::Base::Contract
        schema Api::V2::Dashboard::Schema.update_request

        rule(data: { attributes: :dataset_id }) do
          if _context[:dashboard].powerbi? && (values.dig(:data, :attributes, :enabled) && value.blank?)
            key.failure(:filled?)
          end
        end

        rule(data: { attributes: :report_id }) do
          if _context[:dashboard].powerbi? && (values.dig(:data, :attributes, :enabled) && value.blank?)
            key.failure(:filled?)
          end
        end

        rule(data: { attributes: :project_path }) do
          if _context[:dashboard].oracle_analytics? && (values.dig(:data, :attributes, :enabled) && value.blank?)
            key.failure(:filled?)
          end
        end
      end
    end
  end
end
