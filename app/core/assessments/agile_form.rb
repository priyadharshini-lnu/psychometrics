# frozen_string_literal: true

module Assessments
  class AgileForm < Rectify::Form
    attribute :config, Hash
    attribute :translations, Hash

    def attributes
      super.select { |_, v| v.present? }
    end
  end
end
