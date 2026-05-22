# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::AddReport do
  let(:current_user) { create(:user) }
  let(:campaign_user) { create(:campaign_user) }
  let(:campaign) { campaign_user.campaign }
  let(:user) { campaign_user.user }
  let(:report) { create(:report, assessments: [create(:assessment)]) }
  let!(:hogan_credential) { create(:hogan_credential, user: user) }
  let(:participant_profile) do
    { 'assessmentDetails' => [{ 'assessmentId' => '1', 'formId' => '2', 'status' => 'Completed' }] }
  end

  before(:each) do
    allow(LicenseManager::Deductor).to receive(:call!)
  end

  it 'picks require_scheduling from campaign_assessment' do
    assessment1 = create(:assessment)
    assessment2 = create(:assessment)
    report = create(:report, assessments: [assessment1, assessment2])
    create(:campaign_assessment, campaign: campaign, assessment: assessment1, require_scheduling: true)
    create(:campaign_assessment, campaign: campaign, assessment: assessment2, require_scheduling: false)
    described_class.call!(
      campaign_user, report, assessments: [assessment1, assessment2], current_user: current_user,
      operation: 'add_and_allow_new_response'
    )
    user_assessment1 = user.user_assessments.find_by(assessment: assessment1)
    user_assessment2 = user.user_assessments.find_by(assessment: assessment2)

    expect(user_assessment1.require_scheduling).to eq(true)
    expect(user_assessment2.require_scheduling).to eq(false)
  end

  it 'adds UserReport if not already added' do
    expect do
      described_class.call!(campaign_user, report, assessments: report.assessments)
    end.to change { UserReport.count }.by(1)
  end

  it 'add audit_log for user_report and user_assessment' do
    described_class.call!(
      campaign_user, report, assessments: report.assessments, current_user: current_user,
      operation: 'add_and_allow_new_response'
    )

    user_report = user.user_reports.find_by(report: report)
    user_report_log = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create', record: user_report)
    expect(user_report_log.payload).to eq(
      {
        'campaign_id' => campaign.id, 'report_id' => report.id, 'status' => user_report.status, 'user_id' => user.id,
        'operation' => 'add_and_allow_new_response'
      }
    )

    assessment = report.assessments.first
    user_assessment = user.user_assessments.find_by(assessment: assessment)
    user_assessment_log = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create',
                                           record: user_assessment)
    expect(user_assessment_log.payload).to eq(
      {
        'assessment_id' => assessment.id, 'campaign_id' => campaign.id, 'evaluator_id' => user_assessment.evaluator_id,
        'operation' => 'add_and_allow_new_response', 'relationship_id' => user_assessment.relationship_id,
        'status' => user_assessment.status,
        'subject_id' => user_assessment.subject_id
      }
    )
  end

  it 'create iiht_user_assessment if assessment is of type iiht' do
    assessment = create(:assessment, :iiht)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(assessment.iiht_user_assessments.exists?).to eq(true)
  end

  it 'create mettl_user_assessment if assessment is of type mettl' do
    assessment = create(:assessment, :mettl)
    camapign_assessment = create(:campaign_assessment, campaign: campaign, assessment: assessment)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(assessment.mettl_user_assessments.exists?).to eq(true)
    expect(assessment.mettl_user_assessments.first.mettl_schedule_record_id).to eq(
      camapign_assessment.mettl_schedule_record_id
    )
  end

  it 'create simulation_user_assessment if assessment is of type simulation' do
    assessment = create(:assessment, :simulation)
    camapign_assessment = create(
      :campaign_assessment,
      campaign: campaign,
      assessment: assessment,
      external_config: { content_variation_id: 'starWars' }.to_json
    )
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(assessment.simulation_user_assessments.exists?).to eq(true)
    expect(assessment.simulation_user_assessments.first.content_variation_id).to eq(
      camapign_assessment.external_config['content_variation_id']
    )
  end

  it 'set default content_variation_id if assessment is of type simulation and campaign assessment nil' do
    simulation_settings = Config::Options.new(
      id: 'mte-apply',
      name: 'MTE Apply',
      default_content_variation_id: 'starWars',
      content_variations: [
        Config::Options.new(id: 'starWars', name: 'Star Wars'),
        Config::Options.new(id: 'spicyFood', name: 'Spicy')
      ],
      possible_languages: ['en']
    )
    allow_any_instance_of(Assessment).to receive(:simulation_settings).and_return(simulation_settings)

    assessment = create(:assessment, :simulation, external_settings: { assessment_id: 'mte-apply' })

    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(assessment.simulation_user_assessments.exists?).to eq(true)
    expect(assessment.simulation_user_assessments.first.content_variation_id).to eq(
      'starWars'
    )
  end

  it 'create saville_user_assessment if assessment is of type saville' do
    assessment = create(:assessment, :saville)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)
    saville_user_assessment = assessment.saville_user_assessments.first

    expect(saville_user_assessment.norm_id).to eq(assessment.external_settings[:norm_id])
    expect(saville_user_assessment.data_seprator).to eq(saville_user_assessment.user_assessment.campaign.uniq_code)
  end

  it 'copy saville_user_assessment data if assessment is of type saville with existing_result' do
    assessment = create(:assessment, :saville)
    report = create(:report, assessments: [assessment])

    existing_users_result = create(:users_result, without_user_assessment: true, evaluator: campaign_user.user)
    existing_user_assessment = create(:user_assessment, evaluator: campaign_user.user, assessment: assessment,
users_result: existing_users_result)
    create(:saville_user_assessment, user_assessment: existing_user_assessment, norm_id: 'norm_id',
data_seprator: '4-2')

    described_class.call!(campaign_user, report, assessments: report.assessments)
    saville_user_assessment = assessment.saville_user_assessments.first

    expect(saville_user_assessment.norm_id).to eq('norm_id')
    expect(saville_user_assessment.data_seprator).to eq('4-2')
  end

  it 'create pearson_user_assessment if assessment is of type pearson' do
    assessment = create(:assessment, :pearson)
    report = create(:report, assessments: [assessment])
    create(:campaign_assessment, campaign: campaign, assessment: assessment)
    described_class.call!(campaign_user, report, assessments: report.assessments)
    pearson_user_assessment = assessment.pearson_user_assessments.first

    expect(pearson_user_assessment).to_not eq(nil)
    expect(pearson_user_assessment.norm_id).to eq(assessment.external_settings[:norm_id])
  end

  it 'create yoodli_user_assessment if assessment is of type yoodli' do
    assessment = create(:assessment, :yoodli)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)
    yoodli_user_assessment = assessment.yoodli_user_assessments.first

    expect(yoodli_user_assessment).to be_present
    expect(yoodli_user_assessment.email).to be_nil
  end

  it 'copy yoodli_user_assessment data if assessment is of type yoodli with existing_result' do
    assessment = create(:assessment, :yoodli)
    report = create(:report, assessments: [assessment])

    existing_users_result = create(:users_result, without_user_assessment: true, evaluator: campaign_user.user)
    existing_user_assessment = create(:user_assessment, evaluator: campaign_user.user, assessment: assessment,
                                     users_result: existing_users_result)
    create(:yoodli_user_assessment, user_assessment: existing_user_assessment, email: 'existing@yoodli.com')

    described_class.call!(campaign_user, report, assessments: report.assessments)
    yoodli_user_assessment = assessment.yoodli_user_assessments.last

    expect(yoodli_user_assessment.email).to eq('existing@yoodli.com')
  end

  it 'create microsite_user_assessment if assessment is of type microsite' do
    assessment = create(:assessment, :microsite)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)
    microsite_user_assessment = assessment.microsite_user_assessments.first

    expect(microsite_user_assessment).to be_present
    expect(microsite_user_assessment.participant_id).to be_nil
  end

  it 'copy microsite_user_assessment data if assessment is of type microsite with existing_result' do
    assessment = create(:assessment, :microsite)
    report = create(:report, assessments: [assessment])

    existing_users_result = create(:users_result, without_user_assessment: true, evaluator: campaign_user.user)
    existing_user_assessment = create(:user_assessment, evaluator: campaign_user.user, assessment: assessment,
                                     users_result: existing_users_result)
    create(:microsite_user_assessment, user_assessment: existing_user_assessment,
                                       participant_id: 'existing-participant-123',
                                       url: 'https://microsite.example.com/assessment')

    described_class.call!(campaign_user, report, assessments: report.assessments)
    microsite_user_assessment = assessment.microsite_user_assessments.last

    expect(microsite_user_assessment.participant_id).to eq('existing-participant-123')
    expect(microsite_user_assessment.url).to eq('https://microsite.example.com/assessment')
  end

  it "doesn't adds UserReport if it is already added" do
    create(:user_report, report: report, campaign: campaign_user.campaign, user: campaign_user.user)
    expect { described_class.call!(campaign_user, report, assessments: report.assessments) }.
      to_not(change { UserReport.count })
  end

  it 'adds UserAssessment for each report if not present' do
    expect do
      described_class.call!(campaign_user, report, assessments: report.assessments)
    end.to change { UserAssessment.count }.by(1)
  end

  it "doesn't add UserAssessment for report if it is already present" do
    create(
      :user_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaign_user.campaign,
      subject: campaign_user.user,
      evaluator: campaign_user.user,
      relationship: Relationship.self_relationship
    )
    expect do
      described_class.call!(campaign_user, report, assessments: report.assessments)
    end.to_not(change { UserAssessment.count })
  end

  it 'calls UserReports::GenerateAndSavePdfJob' do
    create(
      :user_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaign_user.campaign,
      subject: campaign_user.user,
      evaluator: campaign_user.user,
      relationship: Relationship.self_relationship
    )
    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later)

    described_class.call!(campaign_user, report, assessments: report.assessments)
  end

  it 'copies users_result if user have previously given the assessment and add_and_allow_new_response is not set' do
    answers = { '1' => [{ 'value' => 10 }] }
    existing_user_result = create(
      :users_result,
      evaluator: campaign_user.user,
      assessment_id: report.assessments.first.id,
      answers: answers
    )
    output = described_class.call!(campaign_user, report, assessments: report.assessments)
    new_user_result = output[:user_assessments].first.users_result

    expect(new_user_result).to_not eq(existing_user_result)
    expect(new_user_result.answers).to eq(answers)
  end

  it 'copies user_assessment data if user have previously given the assessment and add_with_existing_response is set' do
    existing_user_result = create(:users_result, evaluator: campaign_user.user,
assessment_id: report.assessments.first.id)
    existing_user_result.user_assessment.update!(status: :completed, score_calculated: true,
                                                 score_calculated_at: Time.current)
    output = described_class.call!(campaign_user, report, assessments: report.assessments)
    new_user_assessment = output[:user_assessments].first

    expect(new_user_assessment.status).to eq('completed')
    expect(new_user_assessment.score_calculated).to eq(true)
    expect(new_user_assessment.score_calculated_at).to be_present
  end

  it 'copies users_result if user have hogan assessment of same credential and add_with_existing_response is set' do
    allow(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).and_return(participant_profile)

    answers = { '1' => [{ 'value' => 10 }] }
    existing_user_result = create(
      :users_result,
      evaluator: campaign_user.user,
      assessment_id: report.assessments.first.id,
      answers: answers
    )

    report.assessments.first.update!(type: 'Assessments::Hogan')
    create(:resource_hogan_credential, resource: existing_user_result.user_assessment,
hogan_credential: hogan_credential)

    output = described_class.call!(campaign_user, report, assessments: report.assessments,
operation: 'add_with_existing_response')
    new_user_result = output[:user_assessments].first.users_result

    expect(new_user_result).to_not eq(existing_user_result)
    expect(new_user_result.answers).to eq(answers)
  end

  it "create new user_result record if operation is set to 'add_and_allow_new_response'" do
    existing_user_result = create(:users_result,
                                  evaluator: campaign_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(
      campaign_user, report, operation: 'add_and_allow_new_response', assessments: report.assessments
    )

    expect(result[:user_assessments].first.users_result_id).to_not eq(existing_user_result.id)
  end

  it 'create new user_result if user have not previously given the assessment' do
    result = described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(result[:user_assessments].first.users_result).to be_present
  end
end
