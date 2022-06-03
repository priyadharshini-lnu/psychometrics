# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Imports::Assessments::ImportAgileUserResult do
  let!(:client) { create(:project_base) }
  let!(:super_admin) { create(:superadmin) }
  let!(:assessment) { create(:assessment) }
  let!(:campaign) { create(:campaign) }
  let!(:user_result) { create(:users_result) }
  let!(:user) { create(:user, project_id: campaign.project_id) }
  let!(:user_1) { create(:user, project_id: campaign.project_id) }
  let!(:user_assessment) do
    create(:user_assessment, subject: user_1, evaluator: user_1, campaign: campaign, assessment: assessment)
  end
  let(:email) { Faker::Internet.email }
  let!(:headers) do
    [
      [
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
        'edg-1.id',
        'edg-1.answers',
        'edg-1.duration',
        'edg-1.group_id',
        'edg-1.session_id',
        'edg-1.start_time',
        'edg-1.end_time'
      ]
    ]
  end

  let!(:body) do
    Array.new(1) do
      [
        user_result.encoded_id,
        campaign.name,
        'Ryan',
        'kenworthy',
        user_result.user.email,
        assessment.id,
        '05/09/22 11:49:56 AM',
        assessment.name,
        'intro-group,ed-1-group',
        nil,
        'edg-1',
        4,
        1.4,
        'ed-1-group',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        'Sat, 15 Sep 2018 04:46:59 +0000',
        'Sat, 15 Sep 2018 04:48:09 +0000'
      ]
    end
  end

  let(:new_data) do
    [
      [
        '',
        'Project 1',
        'Ryan',
        'kenworthy',
        email,
        assessment.id,
        '05/09/22 11:49:56 AM',
        assessment.name,
        'intro-group,ed-1-group',
        nil,
        'edg-1',
        4,
        1.4,
        'ed-1-group',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        'Sat, 15 Sep 2018 04:46:59 +0000',
        'Sat, 15 Sep 2018 04:48:09 +0000'
      ]
    ]
  end

  let(:with_existing_user_and_user_assessments) do
    [
      [
        '',
        campaign.name,
        'Ryan',
        'kenworthy',
        user_1.email,
        assessment.id,
        '05/09/22 11:49:56 AM',
        assessment.name,
        'intro-group,ed-1-group',
        nil,
        'edg-1',
        4,
        1.4,
        'ed-1-group',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        'Sat, 15 Sep 2018 04:46:59 +0000',
        'Sat, 15 Sep 2018 04:48:09 +0000'
      ]
    ]
  end

  let(:with_existing_user) do
    [
      [
        '',
        'Project 1',
        'Ryan',
        'kenworthy',
        user.email,
        assessment.id,
        '05/09/22 11:49:56 AM',
        assessment.name,
        'intro-group,ed-1-group',
        nil,
        'edg-1',
        4,
        1.4,
        'ed-1-group',
        '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
        'Sat, 15 Sep 2018 04:46:59 +0000',
        'Sat, 15 Sep 2018 04:48:09 +0000'
      ]
    ]
  end

  let(:parsed_array) do
    headers + body
  end

  let(:open_spreadsheet) do
    OpenStruct.new(to_a: parsed_array)
  end

  before(:each) do
    @file = StringIO.new
    @file.class.class_eval { attr_accessor :content_type }
    @file.content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  end

  describe '#process!' do
    context 'All user_results are new' do
      before(:each) do
        new_data.each { |user_result| body << user_result }
        allow_any_instance_of(Imports::Assessments::ImportAgileUserResult).to receive(
          :open_spreadsheet
        ).and_return(open_spreadsheet)
      end

      it 'do not create new user and if user not found then adds error' do
        import = Imports::Assessments::ImportAgileUserResult.new(
          { assessment_id: assessment.id, campaign_id: campaign.id, scoring: false, file: @file }
        )
        import.importer = super_admin
        import.campaign = campaign
        import.assessment = assessment

        expect { import.process! }.to change { User.count }.by(0)

        expect(import.errors.full_messages).to include(
          I18n.t('administration.imports.errors.result.user.record_not_found', email: email)
        )
      end
    end

    context 'with existing user but not user_assessment' do
      before(:each) do
        with_existing_user.each { |user_result| body << user_result }
        allow_any_instance_of(Imports::Assessments::ImportAgileUserResult).to receive(
          :open_spreadsheet
        ).and_return(open_spreadsheet)
      end

      it 'do not create new user and if user not found then adds error' do
        import = Imports::Assessments::ImportAgileUserResult.new(
          { assessment_id: assessment.id, campaign_id: campaign.id, scoring: false, file: @file }
        )
        import.importer = super_admin
        import.campaign = campaign
        import.assessment = assessment

        expect { import.process! }.to change { User.count }.by(0)

        expect(import.errors.full_messages).to include(
          I18n.t(
            'administration.imports.errors.result.user_assessment.record_not_found',
            assessment_id: assessment.id
          )
        )
      end
    end

    context 'existing user and user_assessment' do
      before(:each) do
        with_existing_user_and_user_assessments.each { |user_result| body << user_result }
        allow_any_instance_of(Imports::Assessments::ImportAgileUserResult).to receive(
          :open_spreadsheet
        ).and_return(open_spreadsheet)
      end

      it 'updates existing user_result with imported data' do
        import = Imports::Assessments::ImportAgileUserResult.new(
          { assessment_id: assessment.id, campaign_id: campaign.id, scoring: false, file: @file }
        )
        import.importer = super_admin
        import.campaign = campaign
        import.assessment = assessment
        expect { import.process! }.to change { UsersResult.count }.by(0)
        expect(user_result.reload.answers).to eq(
          [
            {
              'answers' => {
                'edg_1' => {
                  'id' => 'edg-1',
                  'answers' => 4,
                  'duration' => 1.4,
                  'group_id' => 'ed-1-group',
                  'session_id' => '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
                  'start_time' => '1536986819000',
                  'end_time' => '1536986889000'
                }
              }
            }
          ]
        )
        expect(user_result.meta_data).to eq(
          { 'completed_groups' => ['intro-group', 'ed-1-group'] }
        )
      end
    end

    context 'existing user_result' do
      before(:each) do
        allow_any_instance_of(Imports::Assessments::ImportAgileUserResult).to receive(
          :open_spreadsheet
        ).and_return(open_spreadsheet)
      end

      it 'updates existing user_result with imported data' do
        import = Imports::Assessments::ImportAgileUserResult.new(
          { assessment_id: assessment.id, campaign_id: campaign.id, scoring: false, file: @file }
        )
        import.importer = super_admin
        import.campaign = campaign
        import.assessment = assessment
        expect { import.process! }.to change { UsersResult.count }.by(0)
        expect(user_result.reload.answers).to eq(
          [
            {
              'answers' => {
                'edg_1' => {
                  'id' => 'edg-1',
                  'answers' => 4,
                  'duration' => 1.4,
                  'group_id' => 'ed-1-group',
                  'session_id' => '39c19fb5-08e9-4030-adc8-c282f4b1eb1a',
                  'start_time' => '1536986819000',
                  'end_time' => '1536986889000'
                }
              }
            }
          ]
        )
        expect(user_result.meta_data).to eq(
          { 'completed_groups' => ['intro-group', 'ed-1-group'] }
        )
      end
    end
  end
end
