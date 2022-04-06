# frozen_string_literal: true

module UsersResults
  class AgileSerializer < ActiveModel::Serializer
    attributes :id, :groups, :locale, :completed_groups, :assets, :available_locales

    delegate :config, :translations, to: :agile

    def completed_groups
      object.meta_data['completed_groups'] || []
    end

    def groups
      Agiles::ScrubConfig.call!(config.dup)
    end

    def assets
      config['assets']
    end

    def locale
      locales = object.available_locales
      {
        selected: object.user_assessment.selected_locale,
        defaultLocale: I18n.default_locale,
        available: locales,
        translations: translations.slice(*locales)
      }
    end

    def agile
      object.agile
    end

    def attributes(*_)
      super.transform_keys { |k| k.to_s.camelcase(:lower) }
    end
  end
end
