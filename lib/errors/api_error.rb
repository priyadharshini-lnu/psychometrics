# frozen_string_literal: true

module Errors
  class ApiError < StandardError
    attr_reader :code, :message, :status, :more_info, :meta

    def initialize(more_info = nil, meta = nil)
      @more_info = more_info
      @meta = meta
    end
  end
end
