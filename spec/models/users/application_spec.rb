# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Users::Application, type: :model do
  let(:tenant) { create(:tenancy) }
  let(:application_user) { build(:application_user, tenant: tenant) }

  it { should have_many(:api_keys).inverse_of(:application) }

  describe 'validations' do
    it 'is valid with an alphanumeric name' do
      application_user.first_name = 'Lighthouse API'
      expect(application_user).to be_valid
    end

    it 'is invalid when name is blank' do
      application_user.first_name = ''
      application_user.valid?
      expect(application_user.errors[:name]).to be_present
    end

    it 'is invalid when name contains special characters' do
      application_user.first_name = 'My-API!'
      application_user.valid?
      expect(application_user.errors[:name]).to be_present
    end

    it 'is invalid when dasherized name is not unique within the same client' do
      create(:application_user, tenant: tenant, first_name: 'Lighthouse API')
      duplicate = build(:application_user, tenant: tenant, first_name: 'Lighthouse API')
      duplicate.valid?
      expect(duplicate.errors[:name]).to be_present
    end

    it 'allows the same dasherized name in a different client' do
      other_client = create(:tenancy)
      create(:application_user, tenant: tenant, first_name: 'Lighthouse API')
      different_client_user = build(:application_user, tenant: other_client, first_name: 'Lighthouse API')
      expect(different_client_user).to be_valid
    end
  end

  describe 'email and defaults generation on create' do
    it 'sets last_name to App' do
      application_user.save!(validate: false)
      expect(application_user.last_name).to eq('App')
    end

    it 'generates email from dasherized name and tenant_id' do
      application_user.first_name = 'Lighthouse API'
      application_user.save!
      expect(application_user.email).to eq("lighthouse-api.#{tenant.id}@app.com")
    end
  end

  describe '#dasherized_name' do
    it 'returns the parameterized first_name' do
      application_user.first_name = 'My Integration'
      expect(application_user.dasherized_name).to eq('my-integration')
    end
  end

  describe 'authentication restrictions' do
    it 'cannot authenticate (active_for_authentication? is false)' do
      expect(application_user.active_for_authentication?).to be false
    end

    it 'rejects any password (valid_password? is false)' do
      expect(application_user.valid_password?('any_password')).to be false
    end

    it 'does not require a password' do
      expect(application_user.password_required?).to be false
    end

    it 'raises NotImplementedError when invite! is called' do
      expect { application_user.invite! }.to raise_error(NotImplementedError)
    end
  end
end
