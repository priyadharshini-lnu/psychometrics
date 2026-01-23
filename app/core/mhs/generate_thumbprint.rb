# frozen_string_literal: true

module Mhs
  class GenerateThumbprint < Base
    private_attr_reader :source_id, :interpret_as, :observation_items

    def initialize(source_id, interpret_as, observation_items)
      @source_id = source_id
      @interpret_as = interpret_as
      @observation_items = observation_items
    end

    def call
      return '' if observation_items.blank?

      require 'digest'

      data_to_hash = ''

      data_to_hash += source_id.to_s
      data_to_hash += interpret_as.to_s

      data_to_hash += observation_items

      result = Digest::MD5.hexdigest(data_to_hash)

      broadcast :ok, result
      result
    rescue StandardError => e
      broadcast :error, e.message
      ''
    end
  end
end
