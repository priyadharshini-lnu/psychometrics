# frozen_string_literal: true

module Utility
  class Array
    def self.ensure_size(array, size, filler = '')
      array.size > size ? array[0...size] : array.concat([filler] * (size - array.size))
    end
  end
end
