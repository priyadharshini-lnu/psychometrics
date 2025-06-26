# frozen_string_literal: true

module AdminJobs
  class ExportJobRolesTranslations < BaseExportCsv
    def generate_details
      [[I18n.t('administration.job_roles.export.translations.details'), file_link]]
    end

    def headers
      %w[ID] + I18n.available_locales.map do |locale|
        [I18n.t("languages.#{locale}"), locale].join(' / ')
      end
    end

    def records_for_export
      ::JobRole.where(project_id: project&.id).includes(:translations).order(:id)
    end

    def data_row(job_role)
      translations = job_role.translations.group_by(&:locale)
      names = []
      descriptions = []

      I18n.available_locales.map do |locale|
        translation = translations[locale.to_s]&.first
        names << (translation&.name || '')
        descriptions << (translation&.description || '')
      end

      [
        ["#{job_role.id}#Name", *names],
        ["#{job_role.id}#Description", *descriptions]
      ]
    end

    def file_name
      project.present? ? "#{project.name}-job-role-translations.csv" : 'job-role-translations.csv'
    end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end
