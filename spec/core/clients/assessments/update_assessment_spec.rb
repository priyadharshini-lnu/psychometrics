# frozen_string_literal: true

require 'rails_helper'

describe ::Clients::Assessments::UpdateAssessment do
  let(:campaign) { create(:campaign_base, :with_reports) }
  let(:membership) { create(:membership, client: campaign) }
  let(:assessments_client_ids) { campaign.assessments_clients.ids }
  let(:assessments_client) { campaign.assessments_clients.first }
  let(:assessment) { assessments_client.assessment }
  let(:report) { assessment.reports.first }
  let(:report_family) { report.report_families.first }
  let(:form) do
    ::Clients::Assessments::UpdateAssessmentForm.new(assessments_client_ids: assessments_client_ids,
                                                     removing_assessment_ids: [],
                                                     is_applying_to_existing_users: false,
                                                     is_removing_dependent_reports: false)
  end
  before(:each) { allow(form).to receive(:invalid?).and_return(false) }
  subject { described_class.call(form, campaign) }

  it 'broadcast :invalid' do
    allow(form).to receive(:invalid?).and_return(true)
    expect(subject).to eq(invalid: [])
  end

  context '#remove_dependent_reports' do
    before(:each) do
      allow_any_instance_of(described_class).to receive(:removing_dependent_reports).and_return([report])
    end
    it 'broadcast :confirm_remove_dependent_reports' do
      expect(subject).to eq(confirm_remove_dependent_reports: [report])
    end
    it 'dont broadcast' do
      form.is_removing_dependent_reports = true
      expect(subject).not_to eq(confirm_remove_dependent_reports: [report])
    end
    it 'call class to remove reports' do
      form.attributes = { removing_assessment_ids: [assessment.id], is_removing_dependent_reports: true }
      expect(::Clients::Reports::RemoveReport).to receive(:call!).with(campaign, removing_report_ids: [report.id],
                                                                                 is_applying_to_existing_users: false)
      subject
    end
  end

  it 'dont evoke if is_applying_to_existing_users is false' do
    expect_any_instance_of(described_class).not_to receive(:remove_assessments_from_existing_users)
    subject
  end

  context '#reorder_assessments_clients' do
    it 'reorders position of assessments' do
      form.assessments_client_ids = assessments_client_ids.reverse
      subject
      new_assessments_client_ids = campaign.assessments_clients.reload.ids
      expect(assessments_client_ids).not_to eq(new_assessments_client_ids)
      expect(assessments_client_ids.reverse).to eq(new_assessments_client_ids)
    end
  end

  context '#remove_assessments_clients' do
    it 'removes assessment from client' do
      form.removing_assessment_ids = [assessments_client.assessment_id]
      expect { subject }.to change(AssessmentsClient, :count).by(-1)
      expect { assessments_client.reload }.to raise_error ActiveRecord::RecordNotFound
    end
  end

  context '#remove_assessments_from_existing_users' do
    let(:assign) { create(:assign, membership: membership, assessment: assessment) }
    let!(:assigns_report) { create(:assigns_report, :licensed, assign: assign, report: report, user_access: false) }

    it 'removes assessment from existing user' do
      form.attributes = { removing_assessment_ids: [assessments_client.assessment_id],
                          is_applying_to_existing_users: true }
      expect { subject }.to change(Assign, :count).by(-2)
      expect { assign.reload }.to raise_error ActiveRecord::RecordNotFound
      expect { assigns_report.reload }.to raise_error ActiveRecord::RecordNotFound
    end
  end
end
