# frozen_string_literal: true

module Assigns
  class GameSerializer < ActiveModel::Serializer
    attributes :groups, :locale, :completed_groups, :assets

    delegate :config, :translations, to: :game

    def completed_groups
      object.meta_data['completed_groups'] || []
    end

    def groups
      config['groups']
    end

    def assets
      config['assets']
    end

    def locale
      {
        selected: object.selected_locale || I18n.default_locale,
        defaultLocale:  I18n.default_locale,
        available: translations.keys,
        translations: translations
      }
    end

    def game
      object.game
    end

    def attributes(*_)
      Hash[super.to_a.map { |k, v| [k.to_s.camelcase(:lower), v] }]
    end
  end
end
