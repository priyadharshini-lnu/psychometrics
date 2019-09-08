# frozen_string_literal: true

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
  context 'Relations' do
    it { should belong_to(:factor) }
    it { should belong_to(:innovation_style) }
  end

  context 'Validations' do
    it { should validate_presence_of(:predicate) }
    it { should validate_presence_of(:value) }
    it { should validate_numericality_of(:value).is_greater_than_or_equal_to(0).is_less_than_or_equal_to(5).allow_nil }
    it { should validate_numericality_of(:position).is_greater_than_or_equal_to(0) }
  end
end
