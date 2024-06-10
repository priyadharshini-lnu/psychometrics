# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::AgileRawResultExport do
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
      status: :completed,
      answers: YAML.load_file(Rails.root.join('spec/fixtures/agile_answers.yml'))
    )
  end
  let(:job_record) do
    create(
      :admin_job_record, operation: :assessment_raw_result_export,
      data: { campaign_id: campaign.id, assessment_id: assessment.id }
    )
  end
  let!(:user_assessment) do
    create(:user_assessment, subject: user, campaign: campaign, users_result: users_result, status: :completed)
  end

  context 'Agile raw export' do
    it 'first row in csv contains result_details_header along with question ids' do
      assessment.agile.update(config: YAML.load_file(Rails.root.join('spec/fixtures/agile_group.yml')))

      described_class.call!(job_record)

      csv = CsvUtf8.to_array(job_record.file.path)
      actual_first_row = csv[0]

      expected_first_row = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Assessment ID',
        'Assessment Name',
        'Status',
        'Started At',
        'Completed At',
        'Completed Groups',
        'Norm',
        'cmp-1.group_id',
        'cmp-1.id',
        'cmp-1.answers',
        'cmp-1.duration',
        'cmp-1.session_id',
        'cmp-1.start_time',
        'cmp-1.end_time'
      ]

      expect(actual_first_row).to eq(expected_first_row)
    end

    it 'second row in csv  contains actual data' do
      config = YAML.load_file(Rails.root.join('spec/fixtures/agile_group.yml'))
      agile = assessment.agile
      agile.update(config: config)

      described_class.call!(job_record)

      csv = Roo::CSV.new(job_record.file.path)
      actual_second_row = csv.row(2)
      expected_second_row = [
        users_result.encoded_id,
        users_result.subject.first_name,
        users_result.subject.last_name,
        users_result.subject.email,
        assessment.id.to_s,
        assessment.name,
        I18n.t("activerecord.attributes.users_result.statuses.#{users_result.real_status}", locale: :en),
        users_result.started_at.to_s,
        users_result.completed_at.to_s,
        nil,
        nil,
        'nf-1-group',
        'cmp-1',
        'equal',
        '1.502',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        '2022-05-09T07:48:50+00:00',
        '2022-05-09T07:48:51+00:00'
      ]

      expect(actual_second_row).to eq(expected_second_row.flatten)
    end
  end
end
