# == Schema Information
#
# Table name: innovation_styles_factors
#
#  id                  :bigint(8)        not null, primary key
#  innovation_style_id :bigint(8)
#  factor_id           :bigint(8)
#  predicate           :string
#  value               :float
#  position            :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class InnovationStylesFactor < ApplicationRecord
  belongs_to :innovation_style
  belongs_to :factor
end
