# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Users::CreateForm do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:normalized_params) do
    {
      'email' => user.email,
      'first_name' => user.first_name,
      'last_name' => user.last_name,
      'campaigns' => [
        {
          'id' => campaign.id,
          'active' => true,
          'schedule_start_date' => Time.zone.now,
          'schedule_end_date' => 1.day.from_now,
          'existing_record' => 'add_with_existing_response'
        }
      ]
    }
  end

  it 'validates passed attributes' do
    form = described_class.new(normalized_params).with_context(project: campaign.project)
    expect(form.valid?).to eq(true)
  end

  it 'validates presence of email' do
    form = described_class.new(normalized_params.merge(email: nil)).with_context(project: campaign.project)
    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include("can't be blank")
  end

  it 'validates presence of first_name' do
    form = described_class.new(normalized_params.merge(first_name: nil)).with_context(project: campaign.project)
    expect(form.valid?).to eq(false)
    expect(form.errors[:first_name]).to include("can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(normalized_params.merge(last_name: nil)).with_context(project: campaign.project)
    expect(form.valid?).to eq(false)
    expect(form.errors[:last_name]).to include("can't be blank")
  end

  context 'validate_campaigns' do
    it 'validates presence of campaigns' do
      form = described_class.new(normalized_params.merge(campaigns: nil)).with_context(project: campaign.project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:campaigns]).to include('Should be at least one campaign')
    end

    it 'validates presence of campaign' do
      form = described_class.new(normalized_params.merge(campaigns: [])).with_context(project: campaign.project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:campaigns]).to include('Should be at least one campaign')
    end
  end

  context 'validates project_datasheet' do
    it 'validates if project_datasheet not present' do
      form = described_class.new(normalized_params).with_context(project: campaign.project)
      expect(form.valid?).to eq(true)
    end

    it 'validates project_datasheet if present' do
      form = described_class.new(normalized_params.merge(project_datasheet: { 'key' =>
        'value' })).with_context(project: campaign.project)

      expect(form.valid?).to eq(false)
      expect(form.errors[:project_datasheet]).to include('Datasheet is not configured')
    end

    it 'validates project_datasheet if present and sheet present' do
      sheet = create(:datasheet, project: campaign.project)
      create(:sheet_column, sheet: sheet, name: 'key')
      form = described_class.new(normalized_params.merge(project_datasheet: { 'key' =>
        'value' })).with_context(project: campaign.project)

      expect(form.valid?).to eq(true)
    end
  end

  context 'validate_custom_profile_fields' do
    let!(:question) do
      create(:question, props: { questionText: 'Department', type: 'SingleAnswer',
                                 choices: 3, choicesTexts: %w[1 2 3] })
    end
    let!(:profile_field) do
      create(:profile_field, profile_setting: campaign.project.profile_setting, question: question)
    end

    it 'is valid when custom_profile_fields contains a known field' do
      form = described_class.new(normalized_params.merge(custom_profile_fields: { 'Department' => 'Engineering' })).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(true)
    end

    it 'is invalid when custom_profile_fields contains an unknown field name' do
      form = described_class.new(normalized_params.merge(custom_profile_fields: { 'Unknown Field' => 'value' })).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:custom_profile_fields]).to include('Unknown field: Unknown Field')
    end

    it 'is valid when custom_profile_fields is empty' do
      form = described_class.new(normalized_params.merge(custom_profile_fields: {})).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(true)
    end
  end

  context 'with locale' do
    it 'is valid when locale matches a project allowed locale' do
      campaign.project.update!(locales: %w[en ar])
      form = described_class.new(normalized_params.merge(locale: 'ar')).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(true)
    end

    it 'is invalid when locale is not in allowed project locales' do
      campaign.project.update!(locales: ['en'])
      form = described_class.new(normalized_params.merge(locale: 'fr')).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:locale].first).to include('must be one from available locale: [en]')
    end

    it 'is valid when locale is blank' do
      form = described_class.new(normalized_params.merge(locale: nil)).
             with_context(project: campaign.project)
      expect(form.valid?).to eq(true)
    end
  end
end
