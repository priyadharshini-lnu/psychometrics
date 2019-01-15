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
    let(:form) { double('form', 'invalid?': false, attributes: {}) }
    let(:assign) { double('assign', 'completed?': false, step: 1) }
    let(:current_user) { double('user', id: 1) }

    before { allow(assign).to receive_messages(%i[assign_attributes step= save calculate_scoring completed_at=]) }

    it { expect { subject }.to broadcast(:ok) }
    it { expect { subject }.not_to broadcast(:invalid) }

    context '#update_assign' do
      after { described_class.call(form, assign, current_user) }
      subject { assign }

      it { is_expected.to receive(:assign_attributes).with(form.attributes) }
      it { is_expected.to receive(:'step=').with(2) }
      it { is_expected.to receive(:save) }

      context 'assign is completed' do
        before do
          allow(assign).to receive(:'completed?').and_return(true)
          allow_any_instance_of(described_class).to receive(:generate_report)
        end

        it { is_expected.to receive(:calculate_scoring) }
        it { is_expected.to receive(:'completed_at=').with(Time.now) }
      end
    end

    context '#generate_report' do
      before { allow(assign).to receive(:'completed?').and_return(true) }
      after { described_class.call(form, assign, current_user) }

      let(:ids) { [1] }

      before do
        allow(assign).to receive_message_chain(:original_or_self, :assigns_reports) { double }
        allow(assign.original_or_self.assigns_reports).to receive(:update_all).with({ generating: true })
        allow(assign.original_or_self.assigns_reports).to receive(:ids).and_return(ids)
      end

      xit { expect(assign.original_or_self.assigns_reports).to receive(:update_all).with({ generating: true }) }
      xit { expect(::Reports::ExportJob).to receive(:perform_later).with(ids.first, current_user.id) }
    end
  end
end
