require 'rails_helper'

describe ::Clients::AssignReports::AssignReport do
  let(:project) { create(:project) }
  let(:report) { project.clients_reports.first.report }
  let(:assessment) { project.assessments_clients.first.assessment }
  let(:report_family) { report.report_families.first }
  let(:report_ids) { project.reports.ids }
  let(:remove_report_ids) { [] }
  let(:form) do
    double(:form, invalid?: false,
                  report_ids: report_ids,
                  remove_report_ids: remove_report_ids,
                  report_family_id: report_family.id,
                  user_access_report_ids: [],
                  apply_to_existing_users: false)
  end

  subject { described_class.call(form, project) }

  context '#remove_reports_from_client'  do
    it 'dont evoke if remove_report_ids is blank' do
      expect_any_instance_of(described_class).not_to receive(:remove_reports_from_client)
      subject
    end
    context 'passed remove_report_ids' do
      let(:remove_report_ids) { [report.id] }
      let(:new_report) { create(:report, assessment: assessment, assessments: [], report_families: [report_family]) }

      it 'removes reports and assessments' do
        expect { subject }.to change { project.clients_reports.count }.from(1).to(0)
                          .and change { project.assessments_clients.count }.from(6).to(0)
      end

      it 'dont remove crossed assessments and owned assessmnents' do
        create(:clients_report, client: project, report: new_report, report_family: report_family)
        new_assessments_client = create(:assessments_client, client: project)

        expect { subject }.to change { project.assessments_clients.count }.from(7).to(2)
        expect(project.reload.assessments).to include(assessment)
        expect(project.assessments).to include(new_assessments_client.assessment)
      end

      context 'remove and assign same time' do
        let(:report_ids) { [new_report.id] }
        let(:remove_report_ids) { [report.id] }

        it 'dont remove crossed assessments' do
          expect { subject }.to change { project.assessments_clients.count }.from(6).to(1)
          expect(project.reload.assessments).to include(assessment)
        end
      end
    end
  end
end
