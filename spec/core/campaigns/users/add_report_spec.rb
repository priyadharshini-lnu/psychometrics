# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::AddReport do
  let(:current_user) { create(:user) }
  let(:campaign_user) { create(:campaign_user) }
  let(:campaign) { campaign_user.campaign }
  let(:user) { campaign_user.user }
  let(:report) { create(:report, assessments: [create(:assessment)]) }

  before(:each) do
    allow(Licenses::Use).to receive(:call!)
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
    assessment = create(:assessment, :simulation, external_settings: { assessment_id: 'golf-content-variations' })

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
  end

  it 'create pearson_user_assessment if assessment is of type pearson' do
    assessment = create(:assessment, :pearson)
    report = create(:report, assessments: [assessment])
    described_class.call!(campaign_user, report, assessments: report.assessments)
    pearson_user_assessment = assessment.pearson_user_assessments.first

    expect(pearson_user_assessment).to_not eq(nil)
    expect(pearson_user_assessment.norm_id).to eq(assessment.external_settings[:norm_id])
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
