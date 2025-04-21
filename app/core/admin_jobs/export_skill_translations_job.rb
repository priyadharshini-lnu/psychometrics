# frozen_string_literal: true

module AdminJobs
  class ExportSkillTranslationsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.skills.export.translations.details'), file_link]]
    end

    def headers
      %w[ID] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      Skill.where(project_id: record.data['project_id']).includes(:translations).order(:id)
    end

    def data_row(skill)
      translations = skill.translations.group_by(&:locale)
      names = []
      descriptions = []

      I18n.available_locales.map do |locale|
        translation = translations[locale.to_s]&.first
        names << (translation&.name || '')
        descriptions << (translation&.description || '')
      end

      [
        ["#{skill.id}#Name", *names],
        ["#{skill.id}#Description", *descriptions]
      ]
    end

    def file_name
      project&.name ? "#{project.name}-skill-translations.csv" : 'skill-translations.csv'
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
