# frozen_string_literal: true

require 'rails_helper'

describe Administration::Assessments::BuildExternalSettings do
  subject { described_class.call!(assessment, external_settings) }

  let(:assessment) { create(:assessment, type: type) }
  let(:type) { Assessments::Common }
  let(:external_settings) { {} }

  context 'when the assessment is common' do
    let(:type) { Assessments::Common }
    let(:external_settings) { { assessment_id: 'HDS' } }
    it 'returns empty external_settings' do
      expect(subject).to eql({})
    end
  end

  context 'when the assessment is hogan' do
    let(:type) { Assessments::Hogan }
    let(:external_settings) { { assessment_id: 'HDS' } }
    it 'returns valid external_settings' do
      expect(subject).to eql(form_id: 5, assessment_id: 'HDS')
    end
  end

  context 'when the assessment is saville' do
    let(:type) { Assessments::Saville }
    let(:external_settings) { { assessment_id: '1fed08da-44ba-46b6-9be5-2c3b7aec066a' } }
    it 'returns valid external_settings' do
      expect(subject).to eql(
        assessment_id: '1fed08da-44ba-46b6-9be5-2c3b7aec066a', norm_id: '580D2F93-6BCF-4822-A123-CA9617D4BF60'
      )
    end
  end

  context 'when the assessment is pearson' do
    let(:type) { Assessments::Pearson }
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

  context 'when the assessment is mettl' do
    let(:type) { Assessments::Mettl }
    let(:external_settings) { { assessment_id: 'mettl_assessment_id' } }

    it 'returns valid external_settings' do
      expect(subject).to eql(assessment_id: 'mettl_assessment_id')
    end
  end

  context 'when the assessment is skillvue' do
    let(:type) { Assessments::Skillvue }
    let(:external_settings) { { assessment_id: 'skillvue_assessment_id' } }

    it 'returns valid external_settings' do
      expect(subject).to eql(assessment_id: 'skillvue_assessment_id')
    end
  end

  context 'when the assessment is yoodli' do
    let(:type) { Assessments::Yoodli }
    let(:external_settings) { { assessment_id: 'yoodli_assessment_id' } }

    it 'returns valid external_settings' do
      expect(subject).to eql(assessment_id: 'yoodli_assessment_id')
    end
  end

  context 'when the assessment is mhs' do
    let(:type) { Assessments::Mhs }
    let(:external_settings) { { assessment_id: 'mhs_assessment_id' } }

    it 'returns valid external_settings' do
      expect(subject).to eql(assessment_id: 'mhs_assessment_id')
    end
  end

  context 'when the assessment is microsite' do
    let(:type) { Assessments::Microsite }
    let(:catalog_questions) { { 'task-1.q1' => nil, 'task-1.q2' => nil, 'task-2.q1' => nil } }
    let!(:microsite_assessment) do
      create(:microsite_assessment, product_id: 'ms-product-id', metadata: { 'questions' => catalog_questions })
    end

    context 'when question_mappings are provided in the request' do
      let(:provided_mappings) { { 'task-1.q1' => '10', 'task-1.q2' => '11', 'task-2.q1' => '12' } }
      let(:external_settings) { { assessment_id: 'ms-product-id', question_mappings: provided_mappings.to_json } }

      it 'uses the provided question_mappings' do
        expect(subject).to eql(
          assessment_id: 'ms-product-id',
          question_mappings: provided_mappings
        )
      end
    end

    context 'when question_mappings are not provided and the assessment already has mappings' do
      let(:existing_mappings) { { 'task-1.q1' => '10', 'task-1.q2' => '11', 'task-2.q1' => '12' } }
      let(:assessment) do
        create(:assessment, type: type,
               external_settings: { 'assessment_id' => 'ms-product-id', 'question_mappings' => existing_mappings })
      end
      let(:external_settings) { { assessment_id: 'ms-product-id' } }

      it 'preserves the existing question_mappings' do
        expect(subject).to eql(
          assessment_id: 'ms-product-id',
          question_mappings: existing_mappings
        )
      end
    end

    context 'when question_mappings are not provided and no existing mappings exist' do
      let(:assessment) do
        create(:assessment, type: type, external_settings: { 'assessment_id' => 'ms-product-id' })
      end
      let(:external_settings) { { assessment_id: 'ms-product-id' } }

      it 'falls back to default mappings from the catalog with nil values' do
        expect(subject).to eql(
          assessment_id: 'ms-product-id',
          question_mappings: { 'task-1.q1' => nil, 'task-1.q2' => nil, 'task-2.q1' => nil }
        )
      end
    end
  end
end
