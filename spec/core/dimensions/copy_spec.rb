# frozen_string_literal: true

require 'rails_helper'

describe Dimensions::Copy do
  let(:client) { create(:tenancy) }
  let(:dimension) { create(:dimension, owner: client) }
  let(:factors) { create_list(:factor, 2, dimension: dimension) }
  let!(:parent_factor) do
    parent_factor = create(:factor, name: 'parent_factor', dimension: dimension)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factors[0])
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factors[1])
    parent_factor
  end

  it 'duplicates dimension' do
    new_dimension_name = Faker::Name.name
    result = described_class.call!(dimension, [], client, new_dimension_name: new_dimension_name)

    expect(result[:new_dimension]).to be_instance_of(Dimension)
    expect(result[:new_dimension].id).to_not eq(dimension.id)
    expect(result[:new_dimension].name).to eq(new_dimension_name)
  end

  it 'duplicates only factors which are passed as factors_to_copy' do
    new_dimension = described_class.call!(dimension, [factors[0].id], client)[:new_dimension]
    factor1_exists = new_dimension.all_factors.exists?(name: factors[0].name)
    factor2_exists = new_dimension.all_factors.exists?(name: factors[1].name)

    expect(factor1_exists).to eq(true)
    expect(factor2_exists).to eq(false)
  end

  it "doesn't copy same factor twice" do
    new_dimension = described_class.call!(dimension, factors.map(&:id), client)[:new_dimension]
    parent_factor_count = new_dimension.all_factors.where(name: parent_factor.name).count

    expect(parent_factor_count).to eq(1)
  end
end
