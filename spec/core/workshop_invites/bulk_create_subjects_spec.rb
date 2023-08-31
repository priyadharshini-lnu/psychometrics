# frozen_string_literal: true

require 'rails_helper'

describe WorkshopInvites::BulkCreateSubjects do
  let!(:workshop_invite) { create(:workshop_invite) }
  let(:user1) { create(:user) }
  let(:user2) { create(:user) }
  let(:user3) { create(:user) }

  describe '.call' do
    it 'assessment_started' do
      data = [
        { user_id: user1.id },
        { user_id: user2.id }
      ]

      described_class.call!(workshop_invite, data)

      expect(workshop_invite.workshop_invited_subjects.count).to eq(2)
    end

    it 'with exists user' do
      data = [
        { user_id: user1.id },
        { user_id: user2.id },
        { user_id: user3.id }
      ]
      workshop_invite.workshop_invited_subjects.create!(user_id: user1.id)

      described_class.call!(workshop_invite, data)

      expect(workshop_invite.workshop_invited_subjects.count).to eq(3)
    end
  end
end
