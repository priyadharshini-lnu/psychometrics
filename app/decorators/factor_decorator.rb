class FactorDecorator < BaseDecorator

  def subfactors
    object.subfactors_count || 0
  end
end
