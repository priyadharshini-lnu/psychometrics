# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserSavedFilter, type: :model do
  let(:user) { create(:user) }
  let(:resource_type) { 'report_approvals_all' }
  let(:filter_params) { { status: 'pending' }.to_json }

  describe 'validations and associations' do
    it { should belong_to(:user) }
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:filter_params) }
    it { should validate_presence_of(:resource_type) }
  end

  describe 'favorite filter behavior' do
    describe '#ensure_single_favorite' do
      it 'ensures only one filter is favorite per resource type' do
        first_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: true)
        second_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: false)

        second_filter.update!(favorite: true)
        first_filter.reload

        expect(first_filter.favorite).to be false
        expect(second_filter.favorite).to be true
      end
    end

    describe '#make_first_filter_favorite' do
      it 'automatically sets the first filter as favorite' do
        filter = create(:user_saved_filter, user: user, resource_type: resource_type)
        expect(filter.favorite).to be true
      end

      it 'does not override favorite setting' do
        create(:user_saved_filter, user: user, resource_type: resource_type)
        second_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: false)
        third_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: true)

        expect(second_filter.favorite).to be false
        expect(third_filter.favorite).to be true
      end
    end

    describe '#promote_oldest_to_favorite_if_needed' do
      it 'promotes the oldest filter to favorite when a favorite filter is deleted' do
        favorite_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: true,
created_at: 1.day.ago)
        older_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: false,
created_at: 2.days.ago)
        newer_filter = create(:user_saved_filter, user: user, resource_type: resource_type, favorite: false,
created_at: 12.hours.ago)

        favorite_filter.destroy!
        older_filter.reload
        newer_filter.reload

        expect(older_filter.favorite).to be true
        expect(newer_filter.favorite).to be false
      end
    end
  end
end
