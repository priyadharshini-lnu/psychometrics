# frozen_string_literal: true

require 'rails_helper'

describe CampaignFactors::ImportForm do
  let(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension) }

  it 'validates presence of file or roo_excel is not passed' do
    form = described_class.new
    expect(form.valid?).to_not eq(true)
    expect(form.errors[:file]).to include("can't be blank")
  end

  it 'validates file content type' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/test.csv'),
      'text/plain'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:file]).to include('Please upload xlsx file')
  end

  it 'validates headers' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_campaign_factors/invalid_headers.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)

    expect(form.errors[:base]).to include("Following headers are invalid: 'Campaign Factor Group'")
  end

  it 'validates rows' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_campaign_factors/invalid_rows.xlsx'),
      'application/xlsx'
    )

    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)

    expected_errors = [
      'Row 1: Position is not a number',
      "Row 2: Name can't be blank",
      "Row 3: Code can't be blank",
      "Row 4: The code 'sustainability#' should be a valid lua variable name",
      "Row 4: Assessment ID '1' not found in campaign",
      "Row 4: Factor id '9991' not part of assessment's dimension",
      "Row 5: Assessment ID '9999' not found in campaign",
      "Row 5: Factor id '2' not part of assessment's dimension"
    ]

    expect(form.errors[:base]).to match_array(expected_errors)
  end

  it 'passes if file is valid' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'),
      'application/xlsx'
    )

    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(true)
  end

  it 'validates campaign factors count' do
    create_list(:campaign_factor, (CampaignFactor::MAX_CAMPAIGN_FACTORS - 2), campaign: campaign)
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'),
      'application/xlsx'
    )

    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to be false # 298 + 3 new factors in the file
    expect(form.errors[:base]).to include(/No more than 300 campaign factors can be created./)
  end

  it 'return processed rows' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_campaign_factors/valid_file.xlsx'),
      'application/xlsx'
    )

    form = described_class.new(file: file).with_context(campaign: campaign)

    expect(form.processed_rows).to eq([
      {
        'assessment_id' => nil,
        'assessment_score_type' => 'norm_score',
        'campaign_factor_group_name' => 'Overall Scores',
        'code' => 'overall_score',
        'description' => nil,
        'factor_id' => nil,
        'factor_type' => 'formula',
        'formula' => 'return __overall_assessor_score + __overall_online_score',
        'name' => 'Overall score',
        'output_type' => 'numeric',
        'position' => 1,
        'public_visibility' => true,
        'ranked' => false,
        'sheet_column_name' => nil
      },
      {
        'assessment_id' => nil,
        'assessment_score_type' => 'norm_score',
        'campaign_factor_group_name' => 'Overall Scores',
        'code' => 'overall_assessor_score',
        'description' => nil,
        'factor_id' => nil,
        'factor_type' => 'formula',
        'formula' => 'return __test_1 + __test2',
        'name' => 'Overall Assessor score',
        'output_type' => 'numeric',
        'position' => 2,
        'public_visibility' => true,
        'ranked' => false,
        'sheet_column_name' => nil
      },
      {
        'assessment_id' => nil,
        'assessment_score_type' => 'norm_score',
        'campaign_factor_group_name' => 'Overall Scores',
        'code' => 'overall_online_score',
        'description' => nil,
        'factor_id' => nil,
        'factor_type' => 'formula',
        'formula' => 'return __contribution + __sustainability',
        'name' => 'Overall online score',
        'output_type' => 'numeric',
        'position' => 3,
        'public_visibility' => true,
        'ranked' => false,
        'sheet_column_name' => nil
      }
    ])
  end
end
