# frozen_string_literal: true

require 'rails_helper'

describe Administration::Reports::BuildExternalSettings do
  let(:hogan1) { create(:hogan_assessment) }
  let(:pearson) { create(:assessment, :pearson) }
  let(:saville) { create(:assessment, :saville) }
  let(:report) { create(:report) }
  let(:common) { create(:assessment) }

  context 'when report has a hogan provider' do
    it 'extend hogan external settings' do
      result = described_class.call!(report, { report_id: 'EcHPIHDSMVPIBSML' }, 'hogan')
      expect(result).to eq(
        norm_id: 'Global2023',
        report_id: 'EcHPIHDSMVPIBSML',
        language_id: 'en',
        suitability_id: 'Hogan - Leader'
      )
    end
  end

  context 'when report has a pearson provider' do
    it 'returns empty object' do
      result = described_class.call!(report, { provider: 'provider' }, 'pearson')
      expect(result).to eq({})
    end
  end

  context 'when report has a saville provider' do
    it 'returns external settings as is' do
      result = described_class.call!(report, { report_id: 'report_id' }, 'saville')
      expect(result).to eq(
        report_id: 'report_id'
      )
    end
  end

  context 'when report has a mhs provider' do
    it 'returns external settings as is' do
      result = described_class.call!(report, { report_id: 'report_id' }, 'mhs')
      expect(result).to eq(
        report_id: 'report_id'
      )
    end
  end

  context 'when report has internal provider' do
    it 'returns empty object' do
      result = described_class.call!(report, { provider: 'provider', anything: 'bla' }, 'common')
      expect(result).to eq({})
    end
  end
end
