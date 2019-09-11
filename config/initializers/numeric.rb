# frozen_string_literal: true

class Numeric
  def alph
    ('a'..'z').to_a[self - 1] if positive?
  end
end
