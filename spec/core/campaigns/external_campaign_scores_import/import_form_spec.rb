# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::ExternalCampaignScoresImport::ImportForm do
  let(:campaign) { create(:campaign) }
  let(:second_campaign) { create(:campaign) }
  let!(:user) { create(:user, email: 'user@example.com', project: campaign.project) }
  let!(:campaign_factor) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code1', campaign: campaign)
  end

  let!(:campaign_factor2) do
    create(:campaign_factor, factor_type: :external_score, code: 'ext_code2', campaign: campaign)
  end

  it 'validates presence of file is not passed' do
    form = described_class.new
    expect(form.valid?).to_not eq(true)
    expect(form.errors[:file]).to include("can't be blank")
  end

  it 'validates file content type' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/test.xlsx'),
      'application/xlsx'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:file]).to include('file should be one of text/csv, text/plain')
  end

  it 'validates headers' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/invalid_headers.csv'),
      'text/csv'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to include('Following campaign factor_codes are invalid: name')
  end

  it 'validates campaign factor code types' do
    campaign_factor.update!(factor_type: :formula)

    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/invalid_campaign_factor_codes.csv'),
      'text/csv'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to include('Following campaign factor_codes are invalid: ext_code1')
  end

  it 'validates campaign factor code belongs to campain' do
    campaign_factor.update!(campaign_id: second_campaign.id)

    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/invalid_campaign_factor_codes.csv'),
      'text/csv'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to include('Following campaign factor_codes are invalid: ext_code1')
  end

  it 'validates user emails exists' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/file_with_missing_emails.csv'),
      'text/csv'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to include('Following emails are not existing: non_existing_email@example.com')
  end

  it 'passes if file is valid' do
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/valid_file.csv'),
      'text/csv'
    )
    form = described_class.new(file: file).with_context(campaign: campaign)
    expect(form.valid?).to eq(true)
  end

  describe '#processed_rows' do
    let(:file_path) { Rails.root.join('spec/fixtures/files/import_external_campaign_scoring/valid_file.csv') }

    it 'returns processed rows' do
      file = Rack::Test::UploadedFile.new(file_path, 'text/csv')
      form = described_class.new(file: file).with_context(campaign: campaign)

      expect(form.valid?).to eq(true)
      expect(form.processed_rows).to be_an(Array)
      expect(form.processed_rows.size).to eq(1)
    end
  end
end
