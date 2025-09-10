# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopInvite, type: :model do
  let(:workshop) do
    create(:workshop, booked_seats: 0, total_seats: 10, start_time: 1.day.from_now, scheduling_lead_time: 1.hour)
  end
  let(:workshop_invite) { create(:workshop_invite, workshops: [workshop]) }

  describe '#available_workshops_date_and_id' do
    it 'returns available workshops date and id' do
      expect(workshop_invite.available_workshops_date_and_id).to eq([
        { id: workshop.id, date: workshop.start_time.iso8601 }
      ])
    end

    it 'does not return workshops that are fully booked' do
      workshop.update(booked_seats: 10)
      expect(workshop_invite.available_workshops_date_and_id).to eq([])
    end

    it 'does not return workshops that have passed the scheduling lead time' do
      frozen_time = workshop.start_time + 23.hours
      allow(Time).to receive(:current).and_return(frozen_time)
      workshop.update(scheduling_lead_time: 1.hour)
      expect(workshop_invite.available_workshops_date_and_id).to eq([])
    end
  end

  describe '.filterable_fields' do
    let!(:workshop_invite1) { create(:workshop_invite, name: 'Test Workshop', title: 'English Title') }
    let!(:workshop_invite2) { create(:workshop_invite, name: 'Another Workshop', title: 'Different Title') }
    let!(:workshop_invite3) { create(:workshop_invite, name: 'Ruby Workshop', title: 'Coding Session') }

    before do
      Mobility.with_locale(:ar) do
        workshop_invite1.update!(title: 'عنوان عربي')
      end

      Mobility.with_locale(:es) do
        workshop_invite2.update!(title: 'Título Español')
      end
    end

    context 'when search term is numeric' do
      it 'searches by id, name, and translated title' do
        result = WorkshopInvite.filterable_fields(workshop_invite1.id.to_s)
        expect(result).to include(workshop_invite1)
        expect(result).not_to include(workshop_invite2, workshop_invite3)
      end

      it 'searches by name when numeric string matches name pattern' do
        workshop_invite_with_number = create(:workshop_invite, name: '123 Special Workshop')
        result = WorkshopInvite.filterable_fields('123')
        expect(result).to include(workshop_invite_with_number)
      end

      it 'searches by translated title in current locale' do
        I18n.with_locale(:ar) do
          result = WorkshopInvite.filterable_fields('عربي')
          expect(result).to include(workshop_invite1)
          expect(result).not_to include(workshop_invite2, workshop_invite3)
        end
      end

      it 'returns empty result when numeric search does not match anything' do
        result = WorkshopInvite.filterable_fields('999999')
        expect(result).to be_empty
      end
    end

    context 'when search term is non-numeric' do
      it 'searches by name (case insensitive)' do
        result = WorkshopInvite.filterable_fields('test')

        expect(result).to include(workshop_invite1)
        expect(result).not_to include(workshop_invite2, workshop_invite3)
      end

      it 'searches by name with partial match' do
        result = WorkshopInvite.filterable_fields('Workshop')
        expect(result).to include(workshop_invite1, workshop_invite2, workshop_invite3)
      end

      it 'searches by translated title in current locale' do
        I18n.with_locale(:en) do
          result = WorkshopInvite.filterable_fields('English')
          expect(result).to include(workshop_invite1)
          expect(result).not_to include(workshop_invite2, workshop_invite3)
        end
      end

      it 'searches by translated title in different locale' do
        I18n.with_locale(:es) do
          result = WorkshopInvite.filterable_fields('Español')
          expect(result).to include(workshop_invite2)
          expect(result).not_to include(workshop_invite1, workshop_invite3)
        end
      end

      it 'does not find results from other locales when searching in current locale' do
        I18n.with_locale(:en) do
          result = WorkshopInvite.filterable_fields('عربي')
          expect(result).to be_empty
        end
      end

      it 'handles case insensitive search for titles' do
        I18n.with_locale(:en) do
          result = WorkshopInvite.filterable_fields('different title')
          expect(result).to include(workshop_invite2)
        end
      end
    end
  end
end
