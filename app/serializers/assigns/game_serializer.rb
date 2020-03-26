# frozen_string_literal: true

module Assigns
  class GameSerializer < ActiveModel::Serializer
    attributes :groups, :locale, :completedGroups, :assets

    delegate :config, :translations, to: :game

    def completedGroups
      object.meta_data['completed_groups'] || []
    end

    def groups
      config['groups']
    end

    def assets
      config['assets']
    end

    def locale
      translations.merge('selected' => object.selected_locale || I18n.default_locale)
    end

    def game
      object.game
    end
  end
end
