# frozen_string_literal: true

require 'rails_helper'

describe Administration::Assessments::BuildExternalSettings do
  subject { described_class.call!(assessment, external_settings) }

  let(:assessment) { create(:assessment, type: type) }
  let(:type) { ::Assessments::Common }
  let(:external_settings) { {} }

  context 'when the assessment is common' do
    let(:type) { ::Assessments::Common }
    let(:external_settings) { { assessment_id: 'HDS' } }
    it 'returns empty external_settings' do
      expect(subject).to eql({})
    end
  end

  context 'when the assessment is hogan' do
    let(:type) { ::Assessments::Hogan }
    let(:external_settings) { { assessment_id: 'HDS' } }
    it 'returns valid external_settings' do
      expect(subject).to eql(form_id: 5, assessment_id: 'HDS')
    end
  end

  context 'when the assessment is saville' do
    let(:type) { ::Assessments::Saville }
    let(:external_settings) { { assessment_id: '1fed08da-44ba-46b6-9be5-2c3b7aec066a' } }
    it 'returns valid external_settings' do
      expect(subject).to eql(
        assessment_id: '1fed08da-44ba-46b6-9be5-2c3b7aec066a', norm_id: '580D2F93-6BCF-4822-A123-CA9617D4BF60'
      )
    end
  end

  context 'when the assessment is pearson' do
    let(:type) { ::Assessments::Pearson }
    let(:external_settings) { { assessment_id: 'person_id', norm_id: 'n1' } }
    before do
      create(:pearson_assessment,
             product_id: 'person_id',
             norms: {
               'items' => [
                 {
                   'normId' => 'n1',
                   'label' => 'norm1',
                   'supportedLanguage' => 'fr'
                 },
                 {
                   'normId' => 'n2',
                   'label' => 'norm2',
                   'supportedLanguage' => 'no'
                 }
               ]
             })
    end
    it 'returns valid external_settings' do
      expect(subject).to eql(
        assessment_id: 'person_id', norm_id: 'n1', assessment_language: 'fr'
      )
    end
  end
end
