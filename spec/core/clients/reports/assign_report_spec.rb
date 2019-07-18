require 'rails_helper'

describe ::Clients::Reports::AssignReport do
  let(:campaign) { create(:campaign) }
  let(:membership) { create(:membership, client: campaign) }
  let(:reports) { create_list(:report, 2) }
  let(:report) { reports.first }
  let(:assessments) { report.assessments }
  let(:assessment) { report.assessments.first }
  let(:report_family) { report.report_families.first }
  let(:clients_report) { create(:clients_report, report: report, report_family: report_family, client: campaign) }
  let(:assessments_clients) { report.assessments.each { |assessment| create(:assessments_client, assessment: assessment, client: campaign) }}
  let(:adding_report_ids) { [] }
  let(:removing_report_ids) { [] }
  let(:form) do
    ::Clients::Reports::AssignReportForm.new(report_family_id: report_family.id,
                                            adding_report_ids: adding_report_ids,
                                            removing_report_ids: removing_report_ids,
                                            adding_user_access_report_ids: [],
                                            removing_user_access_report_ids: [],
                                            is_applying_to_existing_users: false)
  end
  before(:each) { allow(form).to receive(:invalid?).and_return(false) }
  subject { described_class.call(form, campaign) }

  it 'dont evoke if is_applying_to_existing_users is false' do
    expect_any_instance_of(described_class).not_to receive(:add_reports_to_existing_users)
    expect_any_instance_of(described_class).not_to receive(:add_report_access_for_existing_users)
    subject
  end

  it 'broadcast :invalid' do
    allow(form).to receive(:invalid?).and_return(true)
    expect(subject).to eq(invalid: [])
  end

  context '#add_reports_to_client' do
    let(:adding_report_ids) { [report.id] }

    it 'creates ClientsReport without user_access' do
      expect { subject }.to change { campaign.reports.count }.by(1)
      expect(campaign.reports.ids).to include(*adding_report_ids)
      expect(campaign.clients_reports.first.user_access).to be_falsy
    end
    it 'creates AssessmentsClient' do
      expect { subject }.to change { campaign.assessments.count }.by(10)
      expect(campaign.assessments.reload.ids).to include(*report.assessments.ids)
    end
    it 'adds user_access' do
      clients_report = campaign.clients_reports.first
      form.adding_user_access_report_ids = [clients_report.report_id]
      expect { subject }.to change { clients_report.reload.user_access }.from(false).to(true)
    end

    context 'Dont creates' do
      before(:each) do
        campaign.clients_reports.create(report_id: report.id, report_family_id: report_family.id)
        report.assessment_ids.each do |assessment_id|
          campaign.assessments_clients.create(assessment_id: assessment_id)
        end
      end

      it 'ClientsReport' do
        expect { subject }.not_to change { campaign.reports.count }
      end

      it 'AssessmentsClient' do
        expect { subject }.not_to change { campaign.assessments.count }
      end
    end
  end

  context '#add_report_access_for_client' do
    it do
      clients_report
      form.attributes = { adding_report_ids: [], adding_user_access_report_ids: [report.id] }
      expect { subject }.to change { clients_report.reload.user_access }.from(false).to(true)
    end
  end

  context '#add_reports_to_existing_users' do
    let(:adding_report_ids) { [report.id] }
    before(:each) do
      membership
      allow_any_instance_of(AssignsReport).to receive(:use_license).and_return(true)
      form.is_applying_to_existing_users = true
    end

    it 'creates Assign' do
      expect { subject }.to change { membership.assigns.count }.from(0).to(report.assessments.count)
    end

    it 'creates AssignsReport' do
      expect { subject }.to change { membership.reports.ids.uniq }.from([]).to([report.id])
      expect(membership.assigns.first.assigns_reports.first.user_access).to be_falsy
    end

    it 'adds user_access to report' do
      form.adding_user_access_report_ids = [report.id]
      subject
      expect(membership.assigns.first.assigns_reports.first.user_access).to be_truthy
    end
  end

  context '#add_report_access_for_existing_users' do
    let(:assign) { create(:assign, membership: membership, assessment: assessment) }
    let!(:assigns_report) { create(:assigns_report, :licensed, assign: assign, report: report, user_access: false) }

    it do
      form.attributes = { is_applying_to_existing_users: true,
                          adding_report_ids: [],
                          adding_user_access_report_ids: [report.id] }
      expect { subject }.to change { assigns_report.reload.user_access }.from(false).to(true)
    end
  end
end
