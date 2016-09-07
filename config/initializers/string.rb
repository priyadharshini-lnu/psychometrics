class String
  def valid_float?
    true if Float self rescue false
  end
end
