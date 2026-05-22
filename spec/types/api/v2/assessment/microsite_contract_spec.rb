# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Assessment::MicrositeContract do
  let(:project) { create(:project) }
  let(:dimension) { create(:dimension) }
  let(:create_schema) { Api::V2::Assessment::Schema.create_request }
  let(:update_schema) { Api::V2::Assessment::Schema.update_request }

  let(:microsite_assessment_record) do
    MicrositeAssessment.create!(
      product_id: 'ms-assessment-123',
      name: 'Test Microsite Assessment',
      project: project
    )
  end

  let(:valid_params) do
    jsonapi_resource_request(
      'assessments',
      {
        name: 'New Microsite Assessment',
        type: 'microsite',
        category: Assessment::MICROSITE,
        external_settings: {
          assessment_id: microsite_assessment_record.product_id
        }
      },
      {
        project: { id: project.id.to_s, type: 'clients' },
        dimension: { id: dimension.id.to_s, type: 'dimensions' }
      }
    )
  end

  describe 'category validation' do
    it 'passes with microsite category' do
      contract = described_class.new(schema: create_schema).call(valid_params, {})

      expect(contract.failure?).to be(false)
    end

    it 'fails with non-microsite category' do
      params = valid_params.deep_dup
      params[:data][:attributes][:category] = Assessment::PSYCHOMETRIC

      contract = described_class.new(schema: create_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:category]).to include('must be one of: microsite')
    end
  end

  describe 'external_settings.assessment_id validation' do
    it 'passes with valid assessment_id that exists in MicrositeAssessment' do
      contract = described_class.new(schema: create_schema).call(valid_params, {})

      expect(contract.failure?).to be(false)
    end

    it 'fails when assessment_id is missing' do
      params = valid_params.deep_dup
      params[:data][:attributes][:external_settings].delete(:assessment_id)

      contract = described_class.new(schema: create_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to be_present
    end

    it 'fails when assessment_id does not exist in MicrositeAssessment' do
      params = valid_params.deep_dup
      params[:data][:attributes][:external_settings][:assessment_id] = 'non-existent-id'

      contract = described_class.new(schema: create_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.not_in_the_list?')
      )
    end

    it 'fails when assessment_id belongs to different project' do
      other_project = create(:project)
      other_microsite = MicrositeAssessment.create!(
        product_id: 'ms-other-project',
        name: 'Other Project Assessment',
        project: other_project
      )

      params = valid_params.deep_dup
      params[:data][:attributes][:external_settings][:assessment_id] = other_microsite.product_id

      contract = described_class.new(schema: create_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.not_in_the_list?')
      )
    end
  end

  describe 'unique assessment_id validation' do
    it 'fails when assessment_id is already used by another microsite assessment' do
      existing_assessment = create(
        :assessment,
        category: Assessment::MICROSITE,
        type: Assessments::Microsite,
        external_settings: { 'assessment_id' => microsite_assessment_record.product_id }
      )

      contract = described_class.new(schema: create_schema).call(valid_params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.uniq_microsite', id: existing_assessment.id)
      )
    end

    it 'passes when updating the same assessment' do
      existing_assessment = create(
        :assessment,
        category: Assessment::MICROSITE,
        type: Assessments::Microsite,
        external_settings: { 'assessment_id' => microsite_assessment_record.product_id }
      )

      params = valid_params.deep_dup
      params[:data][:id] = existing_assessment.id.to_s

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(false)
    end
  end

  describe 'question_mappings validation' do
    let!(:assessment) do
      create(
        :assessment,
        category: Assessment::MICROSITE,
        type: Assessments::Microsite,
        external_settings: { 'assessment_id' => microsite_assessment_record.product_id }
      )
    end

    let!(:question1) { create(:question, assessment: assessment) }
    let!(:question2) { create(:question, assessment: assessment) }

    let(:update_params) do
      jsonapi_resource_request(
        'assessments',
        {
          external_settings: {
            assessment_id: microsite_assessment_record.product_id,
            question_mappings: { 'field1' => question1.id, 'field2' => question2.id }.to_json
          }
        },
        {
          project: { id: project.id.to_s, type: 'clients' },
          dimension: { id: dimension.id.to_s, type: 'dimensions' }
        }
      ).tap do |params|
        params[:data][:id] = assessment.id.to_s
      end
    end

    it 'passes when all question IDs exist in the assessment' do
      contract = described_class.new(schema: update_schema).call(update_params, {})

      expect(contract.failure?).to be(false)
    end

    it 'fails when question IDs do not belong to the assessment' do
      other_assessment = create(:assessment)
      other_question = create(:question, assessment: other_assessment)

      params = update_params.deep_dup
      params[:data][:attributes][:external_settings][:question_mappings] =
        { 'field1' => other_question.id }.to_json

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:question_mappings]).to include(
        I18n.t('dry_errors.errors.invalid_question_ids', ids: other_question.id.to_s)
      )
    end

    it 'fails with multiple invalid question IDs' do
      invalid_ids = [99_999, 99_998]

      params = update_params.deep_dup
      params[:data][:attributes][:external_settings][:question_mappings] =
        { 'field1' => invalid_ids[0], 'field2' => invalid_ids[1] }.to_json

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:question_mappings]).to include(
        I18n.t('dry_errors.errors.invalid_question_ids', ids: invalid_ids.join(', '))
      )
    end

    it 'passes when question_mappings is empty' do
      params = update_params.deep_dup
      params[:data][:attributes][:external_settings][:question_mappings] = {}.to_json

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(false)
    end

    it 'passes when question_mappings values are nil' do
      params = update_params.deep_dup
      params[:data][:attributes][:external_settings][:question_mappings] =
        { 'field1' => nil, 'field2' => nil }.to_json

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(false)
    end

    it 'passes when question_mappings is not present' do
      params = update_params.deep_dup
      params[:data][:attributes][:external_settings].delete(:question_mappings)

      contract = described_class.new(schema: update_schema).call(params, {})

      expect(contract.failure?).to be(false)
    end
  end
end
