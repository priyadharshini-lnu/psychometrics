require 'rails_helper'

RSpec.describe Report, type: :model do
  let(:report) { build(:report) }

  describe 'validation number of assessments' do

    context 'greater then max' do
      it 'should be invalid' do
        report.assessments = build_list(:assessment, Report::MAX_ASSESSMENT_COUNT + 1)
        expect(report.valid?).to be_falsey
      end
    end

    context 'lower then min' do
      it 'should be invalid' do
        report.assessments = []
        expect(report.valid?).to be_falsey
      end
    end

    context 'valid number' do
      it 'should be valid' do
        expect(report.valid?).to be_truthy
      end
    end
  end
end
