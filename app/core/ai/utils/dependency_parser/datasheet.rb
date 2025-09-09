# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class Datasheet < Base
        def parse
          ensure_dependency_configured!(
            dependency: 'datasheet',
            condition: has_datasheet_configured?,
            error_message: I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.no_datasheet_configured')
          )

          ensure_dependency_configured!(
            dependency: 'datasheet',
            condition: has_user_datasheet_data?,
            error_message: I18n.t(
              'administration.ai_assistants.artifacts.parsers.datasheet.user_not_found_in_datasheet'
            )
          )

          data = datasheet_user_data(columns: dependency_columns)
          validate_data_availability(data, dependency_columns)

          raise_errors_if_any('Datasheet')

          parse_datasheet_dependency(data)
        end

        private

        def dependency_columns
          return nil if include_all_columns?

          ensure_dependency_configured!(
            dependency: 'datasheet',
            condition: sheet_columns.present?,
            error_message: I18n.t(
              'administration.ai_assistants.artifacts.parsers.datasheet.no_datasheet_columns_configured'
            )
          )

          sheet_columns.pluck(:name)
        end

        def sheet_columns
          @sheet_columns ||= campaign_assistant_artifact.sheet_columns
        end

        def validate_data_availability(data, dependency_columns)
          return if campaign_assistant_artifact.include_all_datasheet_columns

          if dependency_columns.present?
            dependency_columns.each do |column|
              value = data[column] || data[column.to_sym]
              if value.blank?
                add_error(I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.column_no_value',
                                 column: column, email: user.email))
              end
            end
          elsif data.empty? || data.values.all?(&:blank?)
            add_error(I18n.t('administration.ai_assistants.artifacts.parsers.datasheet.no_datasheet_data',
                             email: user.email))
          end
        end

        def parse_datasheet_dependency(data)
          <<~DATASHEET
            <datasheet>
              #{data}
            </datasheet>
          DATASHEET
        end

        def datasheet_user_data(columns: nil)
          return {} if user_datasheet_data.empty?

          return user_datasheet_data if columns.nil?

          user_datasheet_data.slice(*columns)
        end

        def has_datasheet_configured?
          campaign.datasheet.present? || campaign.project.datasheet.present?
        end

        def has_user_datasheet_data?
          user_datasheet_data.present? && !user_datasheet_data.empty?
        end

        def include_all_columns?
          campaign_assistant_artifact.include_all_datasheet_columns
        end

        def user_datasheet_data
          @user_datasheet_data ||= campaign.datasheet_data(user.email)
        end
      end
    end
  end
end
