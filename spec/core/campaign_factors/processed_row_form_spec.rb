# frozen_string_literal: true

require 'rails_helper'

describe CampaignFactors::ProcessedRowForm do
  let(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension) }

  context 'code field' do
    let(:valid_code) { 'valid_code_123' }
    let(:invalid_code) { 'invalid code!' }

    it 'validate uniqueness of code' do
      create(:campaign_factor, campaign: campaign, code: 'overall_score')

      form = described_class.new(row).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include("A factor with the same code 'overall_score' already exists.")
    end

    it 'validates format of code' do
      form = described_class.new(row.merge(code: '1_code')).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include("The code '1_code' should be a valid lua variable name")
    end
  end

  context 'name field' do
    let(:long_name) { 'a' * 65 }
    let(:existing_name) { 'ExistingName' }
    let(:invalid_format_name) { 'name$%^' }

    it 'validates uniqueness of name' do
      create(:campaign_factor, campaign: campaign, name: existing_name)

      form = described_class.new(row.merge(name: existing_name)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include("A factor with the same name '#{existing_name}' already exists.")
    end

    it 'validates length of name' do
      form = described_class.new(row.merge(name: long_name)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include('Name should not exceed 64 characters.')
    end

    it 'validates format of name' do
      form = described_class.new(row.merge(name: invalid_format_name)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include("The name '#{invalid_format_name}' should match the expected format.")
    end
  end

  context 'assessment_id field' do
    let(:assessment) { create(:assessment) }
    let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }
    let(:invalid_assessment_id) { 99_999 }

    it 'validates presence of assessment_id when factor_type is assessment' do
      form = described_class.new(row.merge(factor_type: 'assessment',
                                           assessment_id: nil)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include('Assessment id is required.')
    end

    it 'validates assessment_id exists within the campaign' do
      form = described_class.new(row.merge(factor_type: 'assessment',
                                           assessment_id: invalid_assessment_id)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).to include("Assessment ID '#{invalid_assessment_id}' not found in campaign")
    end

    it 'passes validation when assessment_id is valid and belongs to the campaign' do
      form = described_class.new(row.merge(factor_type: 'assessment',
                                           assessment_id: assessment.id)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages

      expect(errors).not_to include('Assessment id is required.')
      expect(errors).not_to include("Assessment ID '#{assessment.id}' not found in campaign")
    end
  end

  context 'assessment_score_type field' do
    let(:valid_assessment_score_type) { 'percentile' }

    %w[assessment assessor_scoring].each do |type|
      context "when factor_type is #{type}" do
        it 'adds an error if assessment_score_type is blank' do
          form = described_class.new(row.merge(factor_type: type,
                                               assessment_score_type: '')).with_context(campaign: campaign)
          form.valid?

          errors = form.errors.full_messages

          expect(errors).to include('Assessment score type is required.')
        end

        it 'does not add an error if factor_id is present' do
          form = described_class.new(row.merge(
                                       factor_type: type,
                                       assessment_score_type: valid_assessment_score_type
                                     )).with_context(campaign: campaign)
          form.valid?

          errors = form.errors.full_messages

          expect(errors).not_to include('Assessment score type is required.')
        end
      end
    end
  end

  context 'validate_factor_id_presence_for_assessment' do
    let(:valid_factor_id) { '123' }

    %w[assessment assessor_scoring].each do |type|
      context "when factor_type is #{type}" do
        it 'adds an error if factor_id is blank' do
          form = described_class.new(row.merge(factor_type: type, factor_id: nil)).with_context(campaign: campaign)
          form.valid?
          errors = form.errors.full_messages

          expect(errors).to include('Factor id is required.')
        end

        it 'does not add an error if factor_id is present' do
          form = described_class.new(row.merge(factor_type: type,
                                               factor_id: valid_factor_id)).with_context(campaign: campaign)
          form.valid?

          errors = form.errors.full_messages

          expect(errors).not_to include('Factor id is required.')
        end
      end
    end

    it 'does not add an error if factor_type is not assessment or assessor_scoring' do
      form = described_class.new(row.merge(factor_type: 'other', factor_id: nil)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages
      expect(errors).not_to include('Factor id is required.')
    end
  end

  context 'validate_factor_belongs_to_assessment_dimension' do
    let!(:factor) { create(:factor, dimension: dimension, name: 'Accountability') }
    let!(:assessment) { create(:assessment, dimension: dimension) }
    let!(:campaign_assessment) { create(:campaign_assessment, assessment: assessment, campaign: campaign) }

    %w[assessment assessor_scoring].each do |type|
      context "when factor_type is #{type}" do
        it 'adds an error if factor_id is not part of assessments dimention' do
          form = described_class.new(
            row.merge(
              factor_type: type,
              assessment_id: assessment.id,
              factor_id: 9999
            )
          ).with_context(campaign: campaign)

          form.valid?
          errors = form.errors.full_messages

          expect(errors).to include("Factor id '9999' not part of assessment's dimension")
        end

        it 'does not add an error if factor_id is part of assessments dimention' do
          form = described_class.new(
            row.merge(
              factor_type: type,
              assessment_id: assessment.id,
              factor_id: factor.id,
              assessment_score_type: 'percentile'
            )
          ).with_context(campaign: campaign)

          form.valid?
          errors = form.errors.full_messages

          expect(errors).not_to include("Factor id '#{factor.id}' not part of assessment's dimension")
        end
      end
    end

    it 'does not add an error if factor_type is not assessment or assessor_scoring' do
      form = described_class.new(
        row.merge(
          factor_type: 'other',
          factor_id: nil
        )
      ).with_context(campaign: campaign)

      form.valid?
      errors = form.errors.full_messages

      expect(errors).not_to include('Factor id is required.')
    end
  end

  context 'validations' do
    let(:invalid_attributes) do
      {
        code: nil,
        name: nil,
        output_type: nil,
        position: 'not a number',
        factor_type: 'invalid_type',
        public_visibility: nil,
        ranked: 'invalid',
        assessment_score_type: 'invalid_score_type'
      }
    end

    it 'adds appropriate errors for invalid attributes' do
      form = described_class.new(row.merge(invalid_attributes)).with_context(campaign: campaign)
      form.valid?

      errors = form.errors.full_messages
      expect(errors).to include("Code can't be blank")
      expect(errors).to include("Name can't be blank")
      expect(errors).to include("Output type can't be blank")
      expect(errors).to include('Position is not a number')
      expect(errors).to include('Factor type is not included in the list')
      expect(errors).to include('Public visibility is not included in the list', "Public visibility can't be blank")
      expect(errors).to include('Ranked is not included in the list')
      expect(errors).to include('Assessment score type is not included in the list')
    end
  end

  private

  def row
    {
      'position' => 1,
      'name' => 'Overall score',
      'code' => 'overall_score',
      'description' => nil,
      'factor_type' => 'formula',
      'output_type' => 'numeric',
      'factor_id' => nil,
      'assessment_id' => nil,
      'sheet_column_name' => nil,
      'assessment_score_type' => 'norm_score',
      'formula' => 'return __overall_assessor_score + __overall_online_score',
      'ranked' => false,
      'public_visibility' => true,
      'campaign_factor_group_name' => 'Overall Scores'
    }
  end
end
