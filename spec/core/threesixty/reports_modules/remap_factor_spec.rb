# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::ReportsModules::RemapFactor do
  let(:report) { create(:report) }
  let(:page) { create(:page, report: report) }
  let(:old_factor) { create(:factor) }
  let(:new_factor) { create(:factor, name: 'new factor') }
  let(:old_to_new_factor_mapping) do
    old_to_new_factor_mapping = {}
    old_to_new_factor_mapping[old_factor.id] = new_factor
    old_to_new_factor_mapping
  end

  it 'maps single factorId inside props to new factor id' do
    report_module = create(:module, page: page, props: { factorId: old_factor.id })

    described_class.call(report, old_to_new_factor_mapping)

    expect(report_module.reload.props['factorId']).to eq(new_factor.id)
  end

  it "maps all factor inside 'source -> factors' array to new factor" do
    old_factor1 = create(:factor)
    new_factor1 = create(:factor, name: 'new factor 2')
    report_module = create(:module, page: page, props: { source: {
      factors: [factor_source_props(old_factor), factor_source_props(old_factor1)]
    }})
    old_to_new_factor_mapping[old_factor1.id] = new_factor1

    described_class.call(report, old_to_new_factor_mapping)

    source_factor = report_module.reload.props['source']['factors']
    expect(source_factor[0]).to eq(factor_source_props(new_factor))
    expect(source_factor[1]).to eq(factor_source_props(new_factor1))
  end

  private

  def factor_source_props(factor)
    {
      'id' => factor.id,
      'value' => factor.id,
      'parent_id' => factor.parent_id,
      'name' => factor.name,
      'alias' => factor.aliases.find_by(report_id: report.id)&.name
    }
  end
end
