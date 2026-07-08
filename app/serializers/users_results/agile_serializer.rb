# frozen_string_literal: true

module UsersResults
  class AgileSerializer < Panko::Serializer
    attributes :id, :groups, :locale, :completed_groups, :assets, :available_locales, :other_pending_assessments_count,
               :remaining_campaign_time, :remaining_assessment_time

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
      filtered_locales = context[:filtered_locales]
      selected_locale = user_assessment.selected_locale
      default_locale = I18n.default_locale.to_s
      available_locales = object.available_locales
      available_translations = if filtered_locales
                                 translations.slice(*available_locales & [selected_locale, default_locale])
                               else
                                 translations.slice(*available_locales)
                               end

      {
        selected: selected_locale,
        defaultLocale: default_locale,
        available: available_locales,
        translations: available_translations
      }
    end

    def remaining_assessment_time
      return unless user_assessment.expiry_date
      return if object.not_started?

      assessment_time_left = [user_assessment.expiry_date - Time.zone.now, 0].max

      return [assessment_time_left, remaining_campaign_time].min if remaining_campaign_time

      assessment_time_left
    end

    def attributes(*_)
      super.transform_keys { |k| k.to_s.camelcase(:lower) }
    end
  end
end
