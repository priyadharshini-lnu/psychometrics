# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FactorsNorm, type: :model do
  describe '#calc_norm_level' do
    it 'returns norm level when props not sorted' do
      props = [
        { level: 'Very Low', score_from: '1.0', score_to: '2.99' },
        { level: 'Average', score_from: '3.99', score_to: '5.00' },
        { level: 'Low', score_from: '2.99', score_to: '3.99' },
        { level: 'High', score_from: '5.00', score_to: '5.49' },
        { level: 'Very High', score_from: '5.49', score_to: '6.0' }
      ]
      factor_norm = create(:factors_norm, props: props)
      expect(factor_norm.calc_norm_level(3.99)).to eq(2)
    end
  end
end
