# frozen_string_literal: true

require 'rails_helper'

describe Exports::Assessments::AgileAssessmentResultsExport do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign_base) }
  let!(:membership) { create(:membership, client: campaign) }
  let!(:assessment) { create(:assessment, :agile) }
  let(:user) { create(:user) }
  let!(:assign) do
    create(
      :assign,
      subject: user,
      membership: membership,
      assessment: assessment,
      status: 'completed',
      results: YAML.load_file("#{Rails.root}/spec/fixtures/agile_answers.yml")
    )
  end

  let(:file_name) { 'assessment_export.xlsx' }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  context 'Agile export' do
    it 'first row in xlsx contains result_details_header along with question ids' do
      config = YAML.load_file("#{Rails.root}/spec/fixtures/agile_group.yml")
      agile = assessment.agile
      agile.update(config: config)

      xlsx = described_class.call!(assessment, campaign.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_first_row = xlsx.sheet(0).row(1)

      expected_first_row = [
        'ID',
        'Project',
        'First Name',
        'Last Name',
        'Email',
        'Assessment ID',
        'completed_at',
        'Assessment Name',
        nil,
        'cmp-1.answers',
        'cmp-1.duration'
      ]

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx  contains actual data' do
      assessment.agile.update(config: YAML.load_file("#{Rails.root}/spec/fixtures/agile_group.yml"))

      xlsx = described_class.call!(assessment, campaign.id)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [
        assign.encoded_id,
        assign.membership.client.name,
        assign.user.first_name,
        assign.user.last_name,
        assign.user.email,
        assign.assessment_id,
        assign.completed_at.try(:strftime, '%D %r'),
        assign.assessment.name,
        nil,
        nil,
        1.502
      ]

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end
  end
end
