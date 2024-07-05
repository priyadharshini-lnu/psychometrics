# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessment, type: :model do
  it { should validate_presence_of(:type) }
  it { should validate_inclusion_of(:type).in_array(Assessment::TYPES.values) }

  describe '#saville?' do
    it 'returns true for saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:saville])

      expect(assessment.saville?).to eq(true)
    end

    it 'returns false for non saville assessment' do
      assessment = build(:assessment, type: Assessment::TYPES[:common])

      expect(assessment.saville?).to eq(false)
    end
  end

  describe '#external_assessment_name' do
    context 'when assessment type is common' do
      it 'returns nil' do
        assessment = build(:assessment)

        expect(assessment.external_assessment_name).to be_nil
      end
    end

    context 'when external_assessment_id is nil' do
      it 'returns nil' do
        assessment = build(:assessment, type: Assessment::TYPES[:saville])

        expect(assessment.external_assessment_name).to be_nil
      end
    end

    context 'when assessment type is hogan' do
      before do
        allow(Settings.providers.hogan.assessments).to receive(:find).and_return(Struct.new(:name).new(
                                                                                   'HPI'
                                                                                 ))
      end

      let(:hogan_assessment) { create(:hogan_assessment) }

      it 'returns the assessment name' do
        expect(hogan_assessment.external_assessment_name).to eq('HPI')
      end
    end

    context 'when assessment type is saville' do
      before do
        allow(Settings.providers.saville.assessments).to receive(:find).
          and_return(Struct.new(:name).new('Abstract Reasoning Aptitude-Rx (IA)'))
      end

      let(:saville_assessment) { create(:assessment, :saville) }

      it 'returns the assessment name' do
        expect(saville_assessment.external_assessment_name).to eq('Abstract Reasoning Aptitude-Rx (IA)')
      end
    end

    context 'when assessment type is pearson' do
      let(:pearson_assessment) { create(:assessment, :pearson) }

      before do
        create(:pearson_assessment, product_id: pearson_assessment.external_assessment_id, title: 'Pearson Assessment')
      end

      it 'returns the assessment title' do
        expect(pearson_assessment.external_assessment_name).to eq('Pearson Assessment')
      end
    end

    context 'when assessment type is iiht' do
      let(:iiht_assessment) { create(:assessment, :iiht) }

      before do
        allow(Iiht::GetAssessments).to receive(:call!).
          and_return([
            { 'assessmentIdNumber' => iiht_assessment.external_assessment_id,
              'name' => 'assessment_name' }
          ])
      end

      it 'returns the assessment name' do
        expect(iiht_assessment.external_assessment_name).to eq('assessment_name')
      end
    end
  end
end
