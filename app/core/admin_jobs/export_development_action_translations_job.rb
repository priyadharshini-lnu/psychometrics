# frozen_string_literal: true

module AdminJobs
  class ExportDevelopmentActionTranslationsJob < BaseExportCsv
    def generate_details
      [[I18n.t('administration.development_actions.export.translation_details'), file_link]]
    end

    def headers
      %w[ID] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      DevelopmentAction.where(owner_type: 'Client', owner_id: record.data['project_id']).
        includes(:translations).
        order(:id)
    end

    def data_row(development_action)
      translations = development_action.translations.group_by(&:locale)
      names = []
      descriptions = []

      I18n.available_locales.map do |locale|
        translation = translations[locale.to_s]&.first
        names << (translation&.name.presence || '')
        descriptions << (translation&.description.presence || '')
      end

      [
        ["#{development_action.id}#Name", *names],
        ["#{development_action.id}#Description", *descriptions]
      ]
    end

    def file_name
      project&.name ? "#{project.name}-development-action-translations.csv" : 'development-action-translations.csv'
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
