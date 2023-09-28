# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Factor, type: :model do
  let(:dimension) { create(:dimension) }
  let!(:factor) { create(:factor, dimension: dimension) }
  let!(:sub_factor) { create(:factor, dimension: dimension) }
  let!(:factor_sub_factor) { create(:factors_sub_factor, factor: factor, sub_factor: sub_factor) }

  context '#clone_and_save' do
    it 'should be copy all relative sub-factors' do
      cloned_factor = factor.clone_and_save
      expect(cloned_factor.sub_factors.count).to be 1
    end
  end

  it 'deletes record if related :dimension is deleted' do
    expect { factor.dimension.delete }.to change(described_class, :count).by(-2)
  end
end
