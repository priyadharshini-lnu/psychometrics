# frozen_string_literal: true

namespace :i18n do
  namespace :js do
    task before_export: :'assets:environment' do
      I18n.available_locales = Settings.all_locales
      I18n::JS.export
    end
  end
end

task 'i18n:js:export': :'i18n:js:before_export'
