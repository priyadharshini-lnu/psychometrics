# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubjects::MetadataForFiltersFetcher do
  let(:current_user) { create(:superadmin) }
  let(:campaign1) { create(:campaign, name: 'Campaign One') }
  let(:campaign2) { create(:campaign, name: 'Campaign Two') }
  let(:workshop1) { create(:workshop, name: 'Workshop One', campaign: campaign1) }
  let(:workshop2) { create(:workshop, name: 'Workshop Two', campaign: campaign2) }
  let!(:workshop_subject1) { create(:workshop_subject, workshop: workshop1, campaign: campaign1) }
  let!(:workshop_subject2) { create(:workshop_subject, workshop: workshop2, campaign: campaign2) }

  describe '.call' do
    subject { described_class.call(current_user, filter: filter) }

    let(:filter) { nil }

    it 'broadcasts :ok' do
      expect { subject }.to broadcast(:ok)
    end

    it 'returns expected keys' do
      result = subject[:ok]

      expect(result).to include(:campaigns, :slot_names, :attendance_statuses, :scheduling_statuses)
    end

    describe 'campaigns_data' do
      it 'returns all campaigns with workshop subjects' do
        result = subject[:ok][:campaigns]

        expect(result).to contain_exactly(
          { id: campaign1.id, name: 'Campaign One' },
          { id: campaign2.id, name: 'Campaign Two' }
        )
      end

      context 'when filtered by workshop_id_in' do
        let(:filter) { { workshop_id_in: [workshop1.id] } }

        it 'returns only campaigns linked to filtered workshops' do
          result = subject[:ok][:campaigns]

          expect(result).to contain_exactly({ id: campaign1.id, name: 'Campaign One' })
        end
      end
    end

    describe 'slot_names_data' do
      it 'returns all workshops with subjects' do
        result = subject[:ok][:slot_names]

        expect(result).to contain_exactly(
          { id: workshop1.id, name: 'Workshop One' },
          { id: workshop2.id, name: 'Workshop Two' }
        )
      end

      context 'when filtered by campaign_id_in' do
        let(:filter) { { campaign_id_in: [campaign2.id] } }

        it 'returns only workshops linked to filtered campaigns' do
          result = subject[:ok][:slot_names]

          expect(result).to contain_exactly({ id: workshop2.id, name: 'Workshop Two' })
        end
      end
    end

    describe 'attendance_statuses_data' do
      it 'returns all attendance statuses' do
        result = subject[:ok][:attendance_statuses]

        expect(result).to contain_exactly(
          { value: 'no_status', label: 'No status' },
          { value: 'on_time', label: 'On time' },
          { value: 'late', label: 'Late' },
          { value: 'no_show', label: 'No show' },
          { value: 'dropped_out', label: 'Dropped out' }
        )
      end
    end

    describe 'scheduling_statuses_data' do
      it 'returns all scheduling statuses' do
        result = subject[:ok][:scheduling_statuses]

        expect(result).to contain_exactly(
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'rescheduled', label: 'Rescheduled' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'late_rescheduled', label: 'Late rescheduled' },
          { value: 'late_cancelled', label: 'Late cancelled' }
        )
      end
    end
  end
end
