# frozen_string_literal: true

module Assessments
  class GameForm < Rectify::Form
    attribute :config, Array
    attribute :translations, Hash

    def attributes
      super.select { |_, v| v.present? }
    end
  end
end
