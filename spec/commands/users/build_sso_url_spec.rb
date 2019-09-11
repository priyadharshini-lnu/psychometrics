# frozen_string_literal: true

require 'rails_helper'

describe Users::BuildSsoUrl do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:user) { create(:user, project: project) }

  describe 'gen url' do
    it do
      expect(Redis.current).to receive(:setex)
      events = described_class.call(project, user)
      expect(events[:ok].size).to eq 2
      expect(events[:ok].first).to be_url
    end
  end
end
