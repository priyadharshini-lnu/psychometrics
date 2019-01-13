require 'rails_helper'

describe Memberships::CreateAdminCommand do

  describe '.call' do
    let(:client) { create(:tenancy) }
    let(:client_admin) { create(:client_admin) }
    let(:new_membership) { Membership.new({ "parent_id"=>"", "user_attributes"=>{ "first_name"=>"Jon", "last_name"=>"Jones", "email"=>"jon@jones.com" }, "grants_attributes"=>{ "data"=>{ "communications"=>["view", "manage"] }}}) }

    it do
      events = described_class.call(new_membership, client, client_admin, 'client_admin')
      membership = events[:ok]
      expect(membership.grants.data).to eq({ "communications"=>["view", "manage"]})
      expect(membership.user.email).to eq('jon@jones.com')
      expect(membership.user.first_name).to eq('Jon')
      expect(membership.user.last_name).to eq('Jones')
      expect(membership.client_id).to eq(client.id)
      expect(membership.client_admin?).to be true
    end
  end
end
