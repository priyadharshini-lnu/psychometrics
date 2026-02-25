# frozen_string_literal: true

class FactorsSubFactorSerializer < Panko::Serializer
  attributes :id, :weight, :name, :sub_factor_id, :predicate, :value, :position, :factor_type, :description,
             :precision, :score_min, :score_max, :score_definitions, :what_to_look_for, :factor_type

  def name
    object.sub_factor.name
  end

  def description
    object.sub_factor.description
  end

  def precision
    object.sub_factor.precision
  end

  def factor_type
    object.sub_factor.factor_type
  end

  def score_min
    object.sub_factor.score_min
  end

  def score_max
    object.sub_factor.score_max
  end

  def score_definitions
    object.sub_factor.score_definitions
  end

  def what_to_look_for
    object.sub_factor.what_to_look_for
  end
end
