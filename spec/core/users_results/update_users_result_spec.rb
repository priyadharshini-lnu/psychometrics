require 'rails_helper'

describe ::UsersResults::UpdateUsersResult do
  let(:users_result)        { double('users_result') }
  let(:current_user)  { double('user', id: 1) }

  subject { described_class.call(form, users_result, current_user) }

  context 'form is invalid' do
    let(:form) { double('form', 'invalid?': true) }

    it 'broadcast :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:update_users_result)
      # expect_any_instance_of(described_class).not_to receive(:generate_report)
      subject
    end
  end

  context 'form is valid' do
    let(:project)         { create(:project) }
    let(:assessment)      { project.assessments.first }
    let(:report)          { assessment.reports.first }
    let!(:clients_report) { create(:clients_report, client: project, report: report) }
    let(:membership)      { create(:membership, client: project) }
    let(:current_user)    { membership.user }
    let!(:users_result)   { create(:users_result, assessment: assessment, subject: current_user, evaluator: current_user, step: 3) }
    let(:assigns_report)  { create(:assigns_report, :licensed, users_result: users_result, report: report) }
    let(:form)            { double('form', 'invalid?': false, attributes: {}) }

    it { expect { subject }.to broadcast(:ok) }
    it { expect { subject }.not_to broadcast(:invalid) }

    context '#update_assign' do
      after { described_class.call(form, users_result, current_user) }
      subject { users_result }

      it { is_expected.to receive(:assign_attributes).with(form.attributes) }
      it { is_expected.to receive(:'step=').with(4) }
      it { is_expected.to receive(:save!) }

      context 'users_result is completed' do
        before do
          allow(users_result).to receive(:'completed?').and_return(true)
        end

        it { expect(::UsersResults::CalculateScoring).to receive(:call!).with(subject) }
        it { expect(::Assigns::CalculateOccupations).to receive(:call!).with(subject) }
        it { is_expected.to receive(:'completed_at=').with(Time.now) }
      end
    end

    xcontext '#generate_report' do
      before { allow(users_result).to receive(:'completed?').and_return(true) }
      subject { described_class.call(form, users_result, current_user) }

      context 'report is enabled' do
        it 'sets generating status' do
          expect { subject }.to change { assigns_report.reload.generating? }.from(false).to(true)
        end
        it 'sends to generate report' do
          expect(::Reports::ExportJob).to receive(:perform_later).with(assigns_report, current_user)
          subject
        end
      end

      context 'report is disabled' do
        before(:each) { report.update_column(:disabled, true) }
        it 'dont sets generating status' do
          subject
          expect(assigns_report.reload.generating?).to be_falsy
        end
        it 'dont sends to generate report' do
          expect(::Reports::ExportJob).not_to receive(:perform_later).with(assigns_report, current_user)
          subject
        end
      end
    end
  end
end
