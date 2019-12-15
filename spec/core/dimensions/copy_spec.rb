# frozen_string_literal: true

require 'rails_helper'

describe Dimensions::Copy do
  let(:project) { create(:project) }
  let(:dimension) { create(:dimension, owner: project) }
  let(:factors) { create_list(:factor, 2, dimension: dimension) }
  let!(:parent_factor) do
    parent_factor = create(:factor, name: 'parent_factor', dimension: dimension)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factors[0])
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factors[1])
    parent_factor
  end

  it 'duplicates dimension' do
    result = described_class.call!(dimension, [], project)

    expect(result[:new_dimension]).to be_instance_of(Dimension)
    expect(result[:new_dimension].id).to_not eq(dimension.id)
  end

  it 'duplicates only factors which are passed as factors_to_copy' do
    new_dimension = described_class.call!(dimension, [factors[0].id], project)[:new_dimension]
    factor1_exists = new_dimension.all_factors.exists?(name: factors[0].name)
    factor2_exists = new_dimension.all_factors.exists?(name: factors[1].name)

    expect(factor1_exists).to eq(true)
    expect(factor2_exists).to eq(false)
  end

  it "doesn't copy same factor twice" do
    new_dimension = described_class.call!(dimension, factors.map(&:id), project)[:new_dimension]
    parent_factor_count = new_dimension.all_factors.where(name: parent_factor.name).count

    expect(parent_factor_count).to eq(1)
  end
end
