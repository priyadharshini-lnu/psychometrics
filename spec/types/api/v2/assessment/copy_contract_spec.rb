# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Assessment::CopyContract do
  let(:project) { create(:project) }
  let(:source_assessment) { create(:assessment) }

  let(:microsite_assessment_record) do
    MicrositeAssessment.create!(
      product_id: 'ms-assessment-123',
      name: 'Test Microsite Assessment',
      project: project
    )
  end

  let(:base_params) do
    {
      id: source_assessment.id.to_s,
      data: {
        attributes: { name: 'Copied Assessment' }
      }
    }
  end

  let(:microsite_params) do
    {
      id: source_assessment.id.to_s,
      data: {
        attributes: {
          name: 'Copied Assessment',
          external_settings: { assessment_id: microsite_assessment_record.product_id }
        },
        relationships: {
          project: { data: { id: project.id.to_s, type: 'clients' } }
        }
      }
    }
  end

  describe 'name validation' do
    it 'passes with a name' do
      contract = described_class.new.call(base_params, {})

      expect(contract.failure?).to be(false)
    end

    it 'fails with a blank name' do
      params = base_params.deep_dup
      params[:data][:attributes][:name] = '  '

      contract = described_class.new.call(params, {})

      expect(contract.failure?).to be(true)
    end
  end

  describe 'copying as microsite' do
    it 'passes with a valid project and catalog assessment' do
      contract = described_class.new.call(microsite_params, {})

      expect(contract.failure?).to be(false)
    end

    it 'fails when the assessment_id is not in the project catalog' do
      params = microsite_params.deep_dup
      params[:data][:attributes][:external_settings][:assessment_id] = 'unknown-product'

      contract = described_class.new.call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.not_in_the_list?')
      )
    end

    it 'fails when the assessment_id belongs to another project' do
      other_project = create(:project)
      params = microsite_params.deep_dup
      params[:data][:relationships][:project][:data][:id] = other_project.id.to_s

      contract = described_class.new.call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.not_in_the_list?')
      )
    end

    it 'fails when the assessment_id is already bound to another assessment' do
      existing_assessment = create(
        :assessment, :microsite,
        external_settings: { 'assessment_id' => microsite_assessment_record.product_id }
      )

      contract = described_class.new.call(microsite_params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to include(
        I18n.t('dry_errors.errors.uniq_microsite', id: existing_assessment.id)
      )
    end

    it 'fails when the source assessment is an external integration' do
      hogan = create(:assessment, type: Assessment::TYPES[:hogan], dimension: nil)
      params = microsite_params.deep_dup
      params[:id] = hogan.id.to_s

      contract = described_class.new.call(params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to be_present
    end
  end

  describe 'copying a microsite assessment' do
    let(:source_assessment) do
      create(
        :assessment, :microsite,
        external_settings: { 'assessment_id' => 'ms-source-product' }
      )
    end

    it 'requires a new catalog assessment binding' do
      contract = described_class.new.call(base_params, {})

      expect(contract.failure?).to be(true)
      expect(contract.errors[:data][:attributes][:external_settings][:assessment_id]).to be_present
    end

    it 'passes with a new binding' do
      contract = described_class.new.call(microsite_params, {})

      expect(contract.failure?).to be(false)
    end
  end
end
