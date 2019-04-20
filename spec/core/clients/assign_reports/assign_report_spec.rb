require 'rails_helper'

describe ::Clients::AssignReports::AssignReport do
  let(:campaign) { create(:campaign, :with_reports) }
  let(:report) { campaign.clients_reports.first.report }
  let(:assessment) { campaign.assessments_clients.first.assessment }
  let(:assessments) { campaign.assessments }
  let(:report_family) { report.report_families.first }
  let(:report_ids) { campaign.reports.ids }
  let(:remove_report_ids) { [] }
  let(:form) do
    double(:form, invalid?: false,
                  report_ids: report_ids,
                  remove_report_ids: remove_report_ids,
                  report_family_id: report_family.id,
                  user_access_report_ids: [],
                  apply_to_existing_users: false)
  end

  subject { described_class.call(form, campaign) }

  context '#remove_reports_from_client'  do
    it 'dont evoke if remove_report_ids is blank' do
      expect_any_instance_of(described_class).not_to receive(:remove_reports_from_client)
      subject
    end
    context 'passed remove_report_ids' do
      let(:remove_report_ids) { [report.id] }
      let(:new_report) { create(:report, assessment: assessment, assessments: [], report_families: [report_family]) }

      it 'removes reports and assessments' do
        expect { subject }.to change { campaign.clients_reports.count }.from(1).to(0)
                          .and change { campaign.assessments_clients.count }.from(6).to(0)
      end

      it 'dont remove crossed assessments and owned assessmnents' do
        create(:clients_report, client: campaign, report: new_report, report_family: report_family)
        new_assessments_client = create(:assessments_client, client: campaign)

        expect { subject }.to change { campaign.assessments_clients.count }.from(7).to(2)
        expect(campaign.reload.assessments).to include(assessment)
        expect(campaign.assessments).to include(new_assessments_client.assessment)
      end

      context 'Assigns and AssignsReports' do
        let(:membership) { create(:membership, client: campaign) }
        let(:not_started_assign) { create(:assign, assessment: assessments[0], membership: membership, status: 'not_started') }
        let(:completed_assign) { create(:assign, assessment: assessments[1], membership: membership, status: 'completed') }
        let(:assigns_report) { create(:assigns_report, assign: completed_assign, report: assessments[1].reports.first) }
        let(:all_statuses_assigns) do
          Assign.statuses.each.with_index do |(status, value), index|
            create(:assign, assessment: assessments[index], membership: membership, status: status)
          end
        end


        it 'remove not started assign and his assign on campaign level ' do
          not_started_assign
          expect { subject }.to change { Assign.count }.from(2).to(0)
        end

        it 'dont remove assigns with in_progress and completed statuses' do
          all_statuses_assigns

          expect { subject }.to change { Assign.count }.from(6).to(4)
          expect(Assign.projects.pluck(:status)).to eq(['in_progress', 'completed'])
        end

        it 'removes all assigns_reports' do
          assigns_report

          expect { subject }.to change { AssignsReport.count }.from(1).to(0)
        end
      end

      context 'remove and assign same time' do
        let(:report_ids) { [new_report.id] }
        let(:remove_report_ids) { [report.id] }

        it 'dont remove crossed assessments' do
          expect { subject }.to change { campaign.assessments_clients.count }.from(6).to(1)
          expect(campaign.reload.assessments).to include(assessment)
        end
      end
    end
  end
end
