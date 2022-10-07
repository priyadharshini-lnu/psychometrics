# frozen_string_literal: true

class NormSerializer < ActiveModel::Serializer
  attributes :id, :name, :norm_type
end
