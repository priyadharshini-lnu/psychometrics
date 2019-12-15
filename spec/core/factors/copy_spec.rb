# frozen_string_literal: true

require 'rails_helper'

describe Factors::Copy do
  let(:factor) { create(:factor, name: 'sub_factor') }
  let!(:parent_factor) do
    parent_factor = create(:factor, name: 'parent_factor', dimension: factor.dimension)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor)
    parent_factor
  end

  it 'duplicates factor' do
    expect { described_class.call!(factor) }.to change(Factor.count)
    factors_count = factor.dimension.factors.where(name: 'sub_factor').count

    expect(factors_count).to eq(2)
  end

  it 'duplicates ancestor factors' do
    expect { described_class.call!(factor) }.to change(Factor.count)
    factors_count = factor.dimension.factors.where(name: 'parent_factor').count

    expect(factors_count).to eq(2)
  end

  it "doesn't duplicate factor if it is present in old_to_new_factor_mapping" do
    described_class.call!(factor, factor.id => factor)
    factors_count = factor.dimension.factors.where(name: 'sub_factor').count

    expect(factors_count).to eq(1)
  end

  it "doesn't duplicate same ancestor factor if present in old_to_new_factor_mapping" do
    described_class.call!(factor, parent_factor.id => parent_factor)
    factors_count = factor.dimension.factors.where(name: 'parent_factor').count

    expect(factors_count).to eq(1)
  end
end
