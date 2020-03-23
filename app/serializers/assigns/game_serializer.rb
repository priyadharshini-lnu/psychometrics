# frozen_string_literal: true

module Assigns
  class GameSerializer < ActiveModel::Serializer
    attributes :config, :translations, :completed_group_id

    delegate :config, :translations, to: :game

    def completed_group_id
      object.meta_data['completed_group_id']
    end

    def game
      object.game
    end
  end
end
