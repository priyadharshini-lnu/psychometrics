# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::ImportFactors do
  let(:dimension) { create(:dimension) }
  let(:job_record) do
    create(
      :admin_job_record,
      operation: :import_factors,
      data: { dimension_id: dimension.id.to_s }
    )
  end

  describe '#call' do
    context 'with valid CSV file' do
      before do
        file = Rack::Test::UploadedFile.new(
          Rails.root.join('spec/fixtures/files/import_factors/valid_file.csv'),
          'text/csv'
        )
        allow(job_record).to receive(:file).and_return(file)
      end

      it 'creates factors successfully' do
        expect do
          described_class.call!(job_record)
        end.to change(Factor, :count).by(3)

        dimension.reload
        factors = dimension.factors

        expect(factors.count).to eq(3)
        expect(factors.pluck(:name)).to include('Quality Assurance', 'Performance', 'Security')
        expect(factors.pluck(:code)).to include('QAC', 'PERF', 'SEC')

        expect(factors.find_by(code: 'QAC').scoring_strategy).to eq('questions')
        expect(factors.find_by(code: 'PERF').scoring_strategy).to eq('questions_sum')
        expect(factors.find_by(code: 'SEC').scoring_strategy).to eq('questions_percentage')
      end
    end

    context 'when updating existing factors' do
      before do
        create(:factor, name: 'Quality Assurance', code: 'QAC',
        dimension: dimension, scoring_strategy: :questions_percentage)

        file = Rack::Test::UploadedFile.new(
          Rails.root.join('spec/fixtures/files/import_factors/valid_file.csv'),
          'text/csv'
        )
        allow(job_record).to receive(:file).and_return(file)
      end

      it 'updates existing factors' do # when code and name is same
        expect do
          described_class.call!(job_record)
        end.to change(Factor, :count).by(2)
        dimension.reload
        factors = dimension.factors

        expect(factors.count).to eq(3)
        expect(factors.find_by(code: 'QAC').scoring_strategy).to eq('questions')
      end
    end
  end
end
