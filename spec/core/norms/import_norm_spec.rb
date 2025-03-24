# frozen_string_literal: true

require 'rails_helper'

describe Norms::ImportNorm do
  let!(:owner) { create(:tenancy) }
  let!(:dimension) { create(:dimension, name: 'Dimension 1') }
  let!(:factor) { create(:factor, name: 'Factor 1', dimension: dimension) }
  let(:csv_data) do
    <<~CSV
      Norm 1,Dimension 1,Factors,Very Low,,Low,,Average,,High,,Very High,
      ,,Factor 1,0.1,1,1.1,2,2.1,3,3.1,4,4.1,5
    CSV
  end
  let(:importer) { create(:superadmin) }
  let(:rows) { CSV.parse(csv_data, headers: true) }

  it '.call' do
    described_class.call(rows, owner.id, importer)

    expect(FactorsNorm.count).to eq(1)
    expect(FactorsNorm.first.props.count).to eq(5)
    expect(FactorsNorm.first.props).to eq([
      { 'level' => 'Very Low', 'score_from' => '0.1', 'score_to' => '1' },
      { 'level' => 'Low', 'score_from' => '1.1', 'score_to' => '2' },
      { 'level' => 'Average', 'score_from' => '2.1', 'score_to' => '3' },
      { 'level' => 'High', 'score_from' => '3.1', 'score_to' => '4' },
      { 'level' => 'Very High', 'score_from' => '4.1', 'score_to' => '5' }
    ])
  end

  it 'raises error if factor does not exist' do
    csv_data = <<~CSV
      Norm 1,Dimension 1,Factors,Very Low,,Low,,Average,,High,,Very High,
      ,,Factor 2,0.1,1,1.1,2,2.1,3,3.1,4,4.1,5
    CSV
    rows = CSV.parse(csv_data, headers: true)

    expect { described_class.call(rows, owner.id, importer) }.to raise_error(
      Errors::ImportError,
      'Dimension Dimension 1 does not have factor Factor 2'
    )
  end

  it 'raises error if record invalid' do
    user = create(:user)

    expect { described_class.call(rows, owner.id, user) }.to raise_error(
      Errors::ImportError,
      "[Norm] Owner You don't have norms manage permission for #{owner.name}"
    )
  end

  it 'creates norm' do
    described_class.call(rows, owner.id, importer)

    expect(Norm.count).to eq(1)
  end

  it 'creates factor_norm with props' do
    described_class.call(rows, owner.id, importer)

    expect(FactorsNorm.count).to eq(1)
    expect(FactorsNorm.first.props.count).to eq(5)
    expect(FactorsNorm.first.props).to eq([
      { 'level' => 'Very Low', 'score_from' => '0.1', 'score_to' => '1' },
      { 'level' => 'Low', 'score_from' => '1.1', 'score_to' => '2' },
      { 'level' => 'Average', 'score_from' => '2.1', 'score_to' => '3' },
      { 'level' => 'High', 'score_from' => '3.1', 'score_to' => '4' },
      { 'level' => 'Very High', 'score_from' => '4.1', 'score_to' => '5' }
    ])
  end
end
