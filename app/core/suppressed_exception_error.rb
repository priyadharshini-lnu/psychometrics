# frozen_string_literal: true

class SuppressedExceptionError < StandardError
  attr_reader :original_error, :exception_record

  def initialize(original_error, exception_record)
    @original_error = original_error
    @exception_record = exception_record
  end
end
