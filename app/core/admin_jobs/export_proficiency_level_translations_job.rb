# frozen_string_literal: true

module AdminJobs
  class ExportProficiencyLevelTranslationsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.proficiency_levels.export.translations.details'), file_link]]
    end

    def generate_title_link
      {
        href: project ? project_export_path : general_export_path,
        label: project&.name || 'Proficiency Levels Translation Export'
      }
    end

    def headers
      ['ID'] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      ProficiencyLevel.
        where(project_id: project&.id).
        includes(:translations).
        order(:id)
    end

    def data_row(proficiency_level)
      translations = proficiency_level.translations.group_by(&:locale)
      rows = []

      structured_data = process_level_definitions(translations)

      structured_data.each_with_index do |_def, index|
        %w[name level description].each do |field|
          values = I18n.available_locales.map do |locale|
            get_field_value(translations[locale.to_s], index, field)
          end

          # Create a row with the JSONPath notation ID and values
          rows << ["#{proficiency_level.id}#LevelDefinition.$[#{index}].#{field}", *values]
        end
      end

      rows
    end

    def file_name
      project&.name ? "#{project.name}-proficiency-level-translations.csv" : 'proficiency-level-translations.csv'
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end

    def project_export_path
      "/admin/projects/#{project.id}/proficiency_levels/export_translations"
    end

    def general_export_path
      '/admin/proficiency_levels/export_translations'
    end

    def process_level_definitions(translations) # rubocop:disable Metrics/PerceivedComplexity
      # Collect all level definitions and find maximum size
      all_definitions = []

      translations.each_value do |trans|
        trans.each do |t|
          level_def = t&.level_definition
          if level_def.is_a?(Array)
            # Merge new definitions ensuring we have maximum coverage
            level_def.each_with_index do |def_item, index|
              all_definitions[index] ||= {}
              all_definitions[index].merge!(def_item) if def_item.is_a?(Hash)
            end
          elsif level_def.is_a?(Hash)
            # Single definition goes to index 0
            all_definitions[0] ||= {}
            all_definitions[0].merge!(level_def)
          end
        end
      end

      all_definitions
    end

    def get_field_value(locale_translations, index, field)
      return '' unless locale_translations

      translation = locale_translations.first
      return '' unless translation

      level_def = translation.level_definition
      return '' unless level_def

      if level_def.is_a?(Array)
        level_def[index]&.fetch(field, '').to_s
      elsif level_def.is_a?(Hash) && index.zero?
        level_def.fetch(field, '').to_s
      else
        ''
      end
    end
  end
end
