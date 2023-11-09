# frozen_string_literal: true

require 'panko_override/serializer'
require 'panko_override/array_serializer'

module Panko
  class Serializer
    include PankoOverride::Serializer
  end

  class ArraySerializer
    include PankoOverride::ArraySerializer
  end
end
