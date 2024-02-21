# frozen_string_literal: true

require 'rails_helper'

describe Assessments::QuestionsImport::ImportForm do
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
    form = described_class.new(file: file)
    expect(form.valid?).to eq(false)
    expect(form.errors[:file]).to include('Please upload xlsx file')
  end

  it 'validates headers' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_assessment_questions/invalid_headers.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to include("Following headers are invalid: 'Blocks'")
  end

  it 'validates sub headers' do
    dimension = create(:dimension)
    create(:factor, dimension: dimension, name: 'Accountability')
    assessment = create(:assessment, dimension: dimension)

    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_assessment_questions/invalid_sub_headers.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file).with_context(assessment: assessment)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to match_array([
      "'Names' is not a valid subheader for header 'Question'",
      "'Grit' is not a valid subheader for header 'Scoring'"
    ])
  end

  it 'validates rows' do
    dimension = create(:dimension)
    create(:factor, dimension: dimension, name: 'Accountability')
    assessment = create(:assessment, dimension: dimension)

    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_assessment_questions/invalid_rows.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file).with_context(assessment: assessment)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to match_array([
      "Row 3: Question Name can't be blank",
      "Row 3: randomization.type should be either 'All', 'Some' or 'No'",
      "Row 3: TextEntry question property 'type' should be 'Single Line', 'Multi Line' or 'Essay Text Box'",
      "Row 3: Required validation type should be either 'Force' or 'Request'",
      'Row 3: Scores can only be added for MultiChoice and Matrix type question',
      'Row 3: Scores for factor Accountability are invalid. Scores should be comma separated numeric values'
    ])
  end

  it 'passes if file is valid' do
    dimension = create(:dimension)
    create(:factor, dimension: dimension, name: 'Accountability')
    create(:factor, dimension: dimension, name: 'Grit')
    assessment = create(:assessment, dimension: dimension)
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_assessment_questions/valid_file.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file).with_context(assessment: assessment)

    expect(form.valid?).to eq(true)
  end
end
