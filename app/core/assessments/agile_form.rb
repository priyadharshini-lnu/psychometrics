# frozen_string_literal: true

module Assessments
  class AgileForm < Rectify::Form
    attribute :config, Hash
    attribute :translations, Hash
    attribute :extra, Hash

    def attributes
      super.compact_blank
    end
  end
end
