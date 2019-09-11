# frozen_string_literal: true

class String
  def valid_float?
    true if Float self
  rescue StandardError
    false
  end
end
