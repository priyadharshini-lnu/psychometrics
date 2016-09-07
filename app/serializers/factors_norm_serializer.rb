# == Schema Information
#
# Table name: factors_norms
#
#  id         :integer          not null, primary key
#  level      :string
#  score_from :float
#  score_to   :float
#  type       :enum
#  factor_id  :integer
#  norm_id    :integer
#  props      :json
#

class FactorsNormSerializer < ActiveModel::Serializer
  attributes :id, :props, :norm_id, :factor_id, :type
end
