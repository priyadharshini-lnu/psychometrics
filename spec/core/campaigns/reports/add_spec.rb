# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Reports::Add do
  let(:current_user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:report) { create(:report, assessments: create_list(:assessment, 2)) }
  let(:form) do
    Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
  end

  it 'create CampaigsReport if not present' do
    expect do
      described_class.call!(form, campaign, current_user)
    end.to change { CampaignReport.count }.by(1)
  end

  it 'adds audit log fro camapign_report and campaign_assessment' do
    described_class.call!(form, campaign, current_user)

    campaign_report = campaign.campaign_reports.find_by(report: report)
    campaign_report_log = AuditLog.find_by(
      campaign: campaign, user: current_user, action: 'create', record: campaign_report
    )
    expect(campaign_report_log.payload.symbolize_keys).to eq(form.attributes)

    campaign_assessment = campaign.campaign_assessments.find_by(assessment: report.assessments.first)
    campaign_assessment_log = AuditLog.find_by(
      campaign: campaign, user: current_user, action: 'create', record: campaign_assessment
    )
    expect(campaign_assessment_log.payload).to eq(campaign_assessment.slice(:campaign_id, :assessment_id, :norm_id))
  end

  it "doesn't create CampaignReport if it is already present" do
    create(:campaign_report, campaign: campaign, report: report)
    expect do
      described_class.call!(form, campaign, current_user)
    end.to_not(change { CampaignReport.count })
  end

  it 'user_access is set to true in CampaignReport if report access is given' do
    form.report_access = { report.id.to_s => true }
    described_class.call!(form, campaign, current_user)
    campaign_report = campaign.campaign_reports.first

    expect(campaign_report.user_access).to eq(true)
  end

  it 'user_access is set to false in CampaignReport if report access is not given' do
    form.report_access = { report.id.to_s => false }
    described_class.call!(form, campaign, current_user)
    campaign_report = campaign.campaign_reports.first

    expect(campaign_report.user_access).to eq(false)
  end

  it 'creates CampaignAsssessment record for each assessment in report' do
    expect do
      described_class.call!(form, campaign, current_user)
    end.to change { CampaignAssessment.count }.by(2)
  end

  it 'saves saville_norm_id if campaign assessment is a saville assessment' do
    assessment = create(:assessment, :saville)
    report = create(:report, assessments: [assessment])
    form = Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
    described_class.call!(form, campaign, current_user)

    expect(assessment.campaign_assessments.first.external_norm_id).to eq(assessment.external_settings[:norm_id])
  end

  it 'saves mettl_schedule_record_id if campaign assessment is a mettl assessment' do
    assessment = create(:assessment, :mettl)
    mettl_schedule_record = create(:mettl_schedule_record, assessment_id: assessment.id)

    report = create(:report, assessments: [assessment])
    form = Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
    described_class.call!(form, campaign, current_user)

    expect(assessment.campaign_assessments.first.mettl_schedule_record_id).to eq(mettl_schedule_record.id)
  end

  it 'saves external_config if campaign assessment is a simulation assessment' do
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
    form = Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
    described_class.call!(form, campaign, current_user)

    expect(assessment.campaign_assessments.first.external_config['content_variation_id']).to eq('starWars')
  end

  it "doesn't call Campaigns::Users::AddReport record for campaign_user if operation is 'skip_existing'" do
    create(:campaign_user, campaign: campaign)
    form.operation = 'skip_existing'
    expect(Campaigns::Users::AddReport).to_not receive(:call!)

    described_class.call!(form, campaign, current_user)
  end

  it "call Campaigns::Users::AddReport record for campaign_user if operation is not 'skip_existing'" do
    campaign_user = create(:campaign_user, campaign: campaign)
    form.operation = 'add_and_allow_new_response'

    expect(Campaigns::Users::AddReport).to receive(:call!).with(
      campaign_user,
      report,
      current_user: current_user,
      report_family_id: nil,
      user_access: true,
      operation: form.operation,
      assessments: report.assessments,
      pdf_options: {
        low_priority: true
      }
    )

    described_class.call!(form, campaign, current_user)
  end

  it 'saves default occupation_condition_set_id from dimension if occupations are enabled' do
    dimension = create(:dimension, occupations_enabled: true)
    default_ocs = dimension.occupation_condition_sets.find_by(name: 'Default') ||
                  create(:occupation_condition_set, name: 'Default OCS', dimension: dimension)
    dimension.update_column(:default_occupation_condition_set_id, default_ocs.id)
    assessment = create(:assessment, dimension: dimension)
    report = create(:report, assessments: [assessment])
    form = Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })

    described_class.call!(form, campaign, current_user)

    expect(assessment.campaign_assessments.first.occupation_condition_set_id).to eq(default_ocs.id)
  end
end
