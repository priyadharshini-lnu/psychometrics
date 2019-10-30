# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Dimension, type: :model do
  let!(:dimension) { create(:dimension, :with_occupation) }
  let!(:factor) { create(:factor, sub_factors: [create(:factor)], dimension: dimension) }

  context '#clone_and_save' do
    it 'should be copy all relative factors, sub-factors and occupation' do
      cloned_dimension = dimension.clone_and_save
      expect(cloned_dimension.factors.count).to be 1
      expect(cloned_dimension.factors.first.sub_factors.count).to be 1
      expect(cloned_dimension.occupations.count).to be 1
    end
  end
end
