# frozen_string_literal: true

module Assigns
  class GameSerializer < ActiveModel::Serializer
    attributes :groups, :locale, :completedGroups, :assets

    delegate :config, :translations, to: :game

    def completedGroups
      object.meta_data['completedGroups'] || []
    end

    def groups
      config['groups']
    end

    def assets
      config['assets']
    end

    def locale
      translations
    end

    def game
      object.game
    end
  end
end
