# == Schema Information
#
# Table name: occupations_factors
#
#  id            :integer          not null, primary key
#  occupation_id :integer
#  factor_id     :integer
#  predicate     :string
#  value         :float
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  position      :integer
#

class OccupationsFactorSerializer < ActiveModel::Serializer
  attributes :id, :predicate, :value, :position, :weight

  def id
    object.factor_id
  end
end
