require 'rails_helper'

describe UpdateAssign do
  let(:assign)        { double('assign') }
  let(:current_user)  { double('user', id: 1) }

  subject { described_class.call(form, assign, current_user) }

  context 'form is invalid' do
    let(:form) { double('form', 'invalid?': true) }

    it 'broadcast :invalid' do
      expect { subject }.to broadcast(:invalid)
    end

    it 'dont broadcast :ok' do
      expect { subject }.not_to broadcast(:ok)
    end

    it 'dont make transaction' do
      expect_any_instance_of(described_class).not_to receive(:update_assign)
      expect_any_instance_of(described_class).not_to receive(:generate_report)
      subject
    end
  end

  context 'form is valid' do
    let(:project)         { create(:project) }
    let(:assessment)      { create(:assessment) }
    let(:report)          { create(:report, assessment: assessment) }
    let!(:clients_report) { create(:clients_report, client: project, report: report) }
    let(:membership)      { create(:membership, client: project) }
    let(:current_user)    { membership.user }
    let!(:assign)         { create(:assign, assessment: assessment, membership: membership, step: 3) }
    let(:assigns_report)  { create(:assigns_report, :licensed, assign: assign, report: report) }
    let(:form)            { double('form', 'invalid?': false, attributes: {}) }

    it { expect { subject }.to broadcast(:ok) }
    it { expect { subject }.not_to broadcast(:invalid) }

    context '#update_assign' do
      after { described_class.call(form, assign, current_user) }
      subject { assign }

      it { is_expected.to receive(:assign_attributes).with(form.attributes) }
      it { is_expected.to receive(:'step=').with(4) }
      it { is_expected.to receive(:save!) }

      context 'assign is completed' do
        before do
          allow(assign).to receive(:'completed?').and_return(true)
        end

        it { is_expected.to receive(:calculate_scoring) }
        it { is_expected.to receive(:'completed_at=').with(Time.now) }
      end
    end

    context '#generate_report' do
      before { allow(assign).to receive(:'completed?').and_return(true) }
      subject { described_class.call(form, assign, current_user) }

      it { expect{ subject }.to change{ assigns_report.reload.generating? }.from(false).to(true) }
      it do
        expect(::Reports::ExportJob).to receive(:perform_later).with(assigns_report, current_user)
        subject
      end
    end
  end
end
