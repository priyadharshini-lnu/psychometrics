# frozen_string_literal: true

class Api::V2::Administration::Dimensions::FactorsSubFactorResource < Api::V2::Administration::BaseResource
  attributes :id, :weight, :name, :sub_factor_id, :predicate, :value, :position,
             :description, :what_to_look_for, :precision, :scale_min, :scale_max,
             :score_definitions

  def self.records(opts = {})
    super.includes(sub_factor: :translations)
  end

  def description
    @model.sub_factor&.description
  end

  def what_to_look_for
    @model.sub_factor&.what_to_look_for
  end

  def precision
    @model.sub_factor&.precision
  end

  def scale_min
    @model.sub_factor&.scale_min
  end

  def scale_max
    @model.sub_factor&.scale_max
  end

  def score_definitions
    @model.sub_factor&.score_definitions
  end

  def name
    @model.sub_factor&.name
  end
end
