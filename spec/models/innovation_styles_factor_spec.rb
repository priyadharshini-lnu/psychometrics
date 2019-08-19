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

require 'rails_helper'

RSpec.describe InnovationStylesFactor, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
