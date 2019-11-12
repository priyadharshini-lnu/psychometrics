# frozen_string_literal: true

module Reports
  class CopyReport < Rectify::Command
    def initialize(report_id)
      @report = Report.includes(:pages, :modules, :filters).find_by(id: report_id)
    end

    def call
      new_report = Report.transaction do
        new_report = @report.clone
        new_report.save

        new_report.pages << copy_pages
        new_report.filters << copy_filters
      end
    end

    private

    attr_reader :report, :new_report

    def copy_modules(of_page)
      of_page.modules.map do |page_module|
        new_module = page_module.clone(false)
        new_module.page_id = new_page.id

        new_module.translations = copy_translations(page_module, new_module)
        new_module
      end
    end

    def copy_pages
      report.pages.map do |page|
        new_page = page.clone(false)
        new_page.report_id = new_report.id

        new_page.modules = copy_modules(page)

        new_page
      end
    end

    def copy_filters
      report.filters.map do |filter|
        new_filter = filter.clone(false)
        new_filter.report_id = new_report.id
        new_filter.translations = copy_translations(filter, new_filter)

        new_filter
      end
    end

    def copy_factors
      # TODO
    end

    def copy_translations(translateable, translated)
      translations = Translation.for_report(report.id).where(
        translateable_type: translateable.model_name.name,
        translateable_id: translateable.id
      )

      translations.map do |translation|
        new_translation = translation.clone(false)
        translation.translateable_id = translated.id
        translation.resource_id = new_report.id

        new_translation
      end
    end

    def copy_occupations
      # TODO
    end
  end
end
