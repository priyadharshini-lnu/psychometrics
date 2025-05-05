# frozen_string_literal: true

module UsersResults
  class AgileSerializer < Panko::Serializer
    attributes :id, :groups, :locale, :completed_groups, :assets, :available_locales, :other_pending_assessments_count,
               :remaining_campaign_time

    delegate :agile, :user_assessment, to: :object
    delegate :config, :translations, to: :agile
    delegate :other_pending_assessments_count, :campaign_user, to: :user_assessment
    delegate :remaining_campaign_time, to: :campaign_user, allow_nil: true

    def completed_groups
      object.meta_data['completed_groups'] || []
    end

    def groups
      Agiles::ScrubConfig.call!(config.dup, object.seedrandom.to_i)
    end

    def assets
      config['assets']
    end

    def locale
      locales = object.available_locales
      {
        selected: user_assessment.selected_locale,
        defaultLocale: I18n.default_locale,
        available: locales,
        translations: translations.slice(*locales)
      }
    end

    def attributes(*_)
      super.transform_keys { |k| k.to_s.camelcase(:lower) }
    end
  end
end
