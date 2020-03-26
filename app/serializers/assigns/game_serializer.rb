# frozen_string_literal: true

module Assigns
  class GameSerializer < ActiveModel::Serializer
    attributes :groups, :locale, :completedGroups, :assets

    delegate :config, :translations, to: :game

    def completedGroups
      object.meta_data['completedGroups'] || []
    end

    def groups
      config
    end

    def locale
      translations
    end

    def assets
      {
        "images": [
          "background-splash-purple.png",
          "background-splash-darkblue.png",
          "background-splash-lightblue.png",
          "background-splash-green.png",
          "background-splash-white.png",
          "background-splash-blue.jpg",
          "vr-bg.jpg",
          "logo-number-crunch.png",
          "logo-error-detection.png"
        ],
        "atlases": [
          "common",
          "error-detection",
          "verbal-reasoning",
          "mouse-check"
        ],
        "multiatlases": [
          "inductive-reasoning"
        ]
      }
    end

    def game
      object.game
    end
  end
end
