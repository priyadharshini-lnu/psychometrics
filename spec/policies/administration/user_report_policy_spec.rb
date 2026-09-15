# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::UserReportPolicy do
  describe '#view_draft?' do
    it 'allows superadmin' do
      policy = described_class.new(create(:superadmin), UserReport)

      expect(policy.view_draft?).to be true
    end

    it 'allows user with reports manage grant' do
      user = create(:user)
      allow(user).to receive(:has_grant?).with(:reports, :manage).and_return(true)

      policy = described_class.new(user, UserReport)

      expect(policy.view_draft?).to be true
    end

    it 'denies user without reports manage grant' do
      user = create(:user)
      allow(user).to receive(:has_grant?).with(:reports, :manage).and_return(false)

      policy = described_class.new(user, UserReport)

      expect(policy.view_draft?).to be false
    end
  end
end
