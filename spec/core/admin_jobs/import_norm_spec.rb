# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportNorm do
  let(:file) do
    Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_norms/norm.csv'),
      'text/csv'
    )
  end
  let(:owner) { create(:tenancy) }
  let(:user) { create(:superadmin) }
  let(:job_record) do
    create(
      :admin_job_record, operation: :import_norm,
      data: { owner_id: owner.id }
    )
  end
  let!(:dimension) { create(:dimension, name: 'Dimension 1') }

  before do
    allow(job_record).to receive(:owner).and_return(user)
    allow(job_record).to receive(:file).and_return(file)
  end

  context 'Import Norm' do
    it 'creates norm' do
      described_class.call!(job_record)

      expect(Norm.count).to eq(1)
    end

    it 'returns error if factor does not exist' do
      result = described_class.call!(job_record)

      expect(result).to eq(
        { error_messages: ['Dimension Dimension 1 does not have factor Factor 1'] }
      )
      expect(FactorsNorm.count).to eq(0)
    end

    it 'returns error if factor does not exist' do
      create(:factor, name: 'Factor 1', dimension: dimension)
      described_class.call!(job_record)

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
end
