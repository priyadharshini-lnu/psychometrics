# frozen_string_literal: true

require 'rails_helper'

describe Assessments::Export::AgileRaw do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment, :agile) }
  let(:user) { create(:user) }
  let(:users_result) do
    create(
      :users_result,
      subject: user,
      evaluator: user,
      campaign: campaign,
      assessment: assessment,
      answers: YAML.load_file("#{Rails.root}/spec/fixtures/agile_answers.yml")
    )
  end

  let!(:user_assessment) { create(:user_assessment, subject: user, campaign: campaign, users_result: users_result) }
  let(:file_name) { "#{SecureRandom.uuid}.xlsx" }

  after do
    FileUtils.rm(file_name) if File.exist?(file_name)
  end

  context 'Agile raw export' do
    it 'first row in xlsx contains result_details_header along with question ids' do
      assessment.agile.update(config: YAML.load_file("#{Rails.root}/spec/fixtures/agile_group.yml"))

      xlsx = described_class.call!(assessment, campaign)
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
        'Completed Groups',
        nil,
        'cmp-1.id',
        'cmp-1.answers',
        'cmp-1.duration',
        'cmp-1.group_id',
        'cmp-1.session_id',
        'cmp-1.start_time',
        'cmp-1.end_time'
      ]

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in xlsx  contains actual data' do
      config = YAML.load_file("#{Rails.root}/spec/fixtures/agile_group.yml")
      agile = assessment.agile
      agile.update(config: config)

      xlsx = described_class.call!(assessment, campaign)
      xlsx.serialize(file_name)

      xlsx = Roo::Spreadsheet.open(file_name)
      actual_second_row = xlsx.sheet(0).row(2)
      expected_second_row = [
        users_result.encoded_id,
        users_result.campaign.try(:name),
        users_result.subject.first_name,
        users_result.subject.last_name,
        users_result.subject.email,
        assessment.id,
        users_result.completed_at.try(:strftime, '%D %r'),
        assessment.name,
        nil,
        nil,
        'cmp-1',
        'equal',
        1.502,
        'nf-1-group',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        'Mon, 09 May 2022 07:48:50 +0000',
        'Mon, 09 May 2022 07:48:51 +0000'
      ]

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end
  end
end
