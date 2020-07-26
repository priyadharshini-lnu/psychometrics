# frozen_string_literal: true

class Administration::FactorsNormPolicy < Administration::BasePolicy
  def update_percentile_norm?
    update?
  end
end
