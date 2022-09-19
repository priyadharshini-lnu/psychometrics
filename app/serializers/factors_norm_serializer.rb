# frozen_string_literal: true

class FactorsNormSerializer < ActiveModel::Serializer
  attributes :id, :props, :norm_id, :factor_id, :type
end
