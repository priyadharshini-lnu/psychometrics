# frozen_string_literal: true

module Integrations
  class HoganForm < Integrations::BaseForm
    attribute :provider, String

    validates :provider, presence: true
  end
end
