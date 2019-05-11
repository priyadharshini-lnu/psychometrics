module Errors
  class ApiError < StandardError
    attr_reader :code, :message, :status, :more_info

    def initialize(more_info = nil)
      @more_info = more_info
    end
  end
end
