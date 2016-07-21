module Errors
  class ImportError < StandardError
    attr_accessor :description, :status

    def initialize(description = nil, status = 400)
      @description = description
      @status      = status
    end

    def to_s
      "[#{status}] #{description}"
    end
  end
end