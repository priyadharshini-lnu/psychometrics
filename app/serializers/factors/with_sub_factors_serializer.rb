# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  questions_count  :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :string
#  disabled         :boolean          default(FALSE)
#
module Factors
  class WithSubFactorsSerializer < ActiveModel::Serializer
    type :factor
    attributes :id, :name

    def sub_factors
      object.sub_factors.map do |sub_factors|
        SubFactorSerializer.new(sub_factors)
      end
    end
  end
end
