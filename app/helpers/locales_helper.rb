# frozen_string_literal: true

module LocalesHelper
  LOCALES = {
    'ar' => 'rtl'
  }.freeze

  def rtl?
    LOCALES[I18n.locale[0...2]] == 'rtl'
  end

  def dir
    rtl? ? 'rtl' : 'ltr'
  end

  def load_report_translation_file(params)
    return unless params[:all]

    data = params[:all].match(%r{/user_reports/(\d+)})
    return unless data

    lang = params[:report_lang] || UserReport.find_by(id: data[1])&.report&.default_language

    javascript_include_tag "administration/i18n/#{lang}.js" if lang && lang != I18n.locale.to_s
  end

  def load_report_builder_translation_file
    lang = params[:lang] || Report.find_by(id: params[:id]).default_language
    javascript_include_tag "administration/i18n/#{lang}.js" if lang && lang != I18n.locale.to_s
  end
end
