# frozen_string_literal: true

require 'rails_helper'

describe Client, type: :model do
  it { should have_one(:datasheet).dependent(:destroy).with_foreign_key(:project_id) }

  describe 'subdomain validations' do
    context 'when client is a root (tenancy)' do
      let(:client) { build(:tenancy) }

      it 'is invalid without a subdomain' do
        client.subdomain = nil
        expect(client).not_to be_valid
        expect(client.errors[:subdomain]).to include("can't be blank")
      end

      it 'is valid with a properly formatted subdomain' do
        client.subdomain = 'valid-subdomain123'
        expect(client).to be_valid
      end

      it 'is invalid if subdomain has an admin pattern (case-insensitive)' do
        invalid_subdomains = %w[test-admin admin test-admin-project TEST-ADMIN AdMiN test-AdMin-project]
        admin_error = I18n.t('admin.subdomain_admin_keyword')
        invalid_subdomains.each do |subdomain|
          client.subdomain = subdomain
          expect(client).not_to be_valid
          expect(client.errors[:subdomain]).to include(admin_error)
        end
      end

      it 'is valid for subdomains containing admin as part of a word' do
        valid_subdomains = %w[admin-console administrator notadmin]
        valid_subdomains.each do |subdomain|
          client.subdomain = subdomain
          expect(client).to be_valid
        end
      end
    end

    context 'when client is a project' do
      let(:parent_client) { create(:tenancy) }
      let(:project) { create(:project, parent: parent_client) }

      it 'is invalid without a subdomain' do
        project.subdomain = nil
        expect(project).not_to be_valid
        expect(project.errors[:subdomain]).to include("can't be blank")
      end

      it 'is invalid if subdomain has an admin pattern (case-insensitive)' do
        invalid_subdomains = %w[test-admin admin test-admin-project TEST-ADMIN AdMiN test-AdMin-project]
        admin_error = I18n.t('admin.subdomain_admin_keyword')
        invalid_subdomains.each do |subdomain|
          project.subdomain = subdomain
          expect(project).not_to be_valid
          expect(project.errors[:subdomain]).to include(admin_error)
        end
      end

      it 'is valid for subdomains containing admin as part of a word' do
        valid_subdomains = %w[admin-console administrator notadmin]
        valid_subdomains.each do |subdomain|
          project.subdomain = subdomain
          expect(project).to be_valid
        end
      end
    end

    context 'uniqueness' do
      let!(:existing_client) { create(:tenancy, subdomain: 'shared-domain') }
      let(:parent_client) { create(:tenancy) }
      let(:new_project) { build(:project, parent: parent_client, subdomain: 'shared-domain') }
      let(:new_client) { build(:tenancy, subdomain: 'shared-domain') }

      it 'enforces uniqueness across both projects and root clients' do
        expect(new_project).not_to be_valid
        expect(new_project.errors[:subdomain]).to include('has already been taken')

        expect(new_client).not_to be_valid
        expect(new_client.errors[:subdomain]).to include('has already been taken')
      end
    end
  end

  describe '#hogan_group_name' do
    let(:project) { create(:project) }

    it 'should not be empty' do
      expect(project.reload.hogan_group_name).not_to be_empty
    end

    it 'should be correct' do
      expect(project.reload.hogan_group_name).to eq("#{project.client.name}-#{project.id}")
    end
  end

  describe 'Ransack column filters' do
    let(:user_two) { create(:user) }

    it 'work on name' do
      clients = create_list(:client, 10, number: 101, country: 'UAE',
        year: '2019', project_manager_id: user_two.id)
      name = clients.last.name
      specific_client = Client.ransack(filterable_fields: name).result
      all_clients = Client.ransack(filterable_fields: 'Client').result
      expect(specific_client.length).to eq(1)
      expect(all_clients.length).to eq(10)
    end

    it 'work on id' do
      create_list(:client, 10, number: 101, country: 'UAE', year: '2019',
        project_manager_id: user_two.id)
      id = Client.all.sample.id
      specific_client = Client.ransack(filterable_fields: id).result
      expect(specific_client.length).to be >= 1
    end

    it 'work with erroneous values' do
      create_list(:client, 10, number: 101, country: 'UAE', year: '2019',
        project_manager_id: user_two.id)
      id = nil
      client = Client.ransack(filterable_fields: id).result
      expect(client.length).to eq(Client.count)

      name = ''
      client = Client.ransack(filterable_fields: name).result
      expect(client.length).to eq(Client.count)

      random_string = 'this possibly cant be a client name'
      client = Client.ransack(filterable_fields: random_string).result
      expect(client.length).to eq(0)
    end
  end

  describe '#hogan_provider' do
    let(:project) { create(:project) }

    context 'provider is set as mercer in integration' do
      let!(:integration) { create(:integration, :hogan_integration, project: project) }

      it 'creates hogan credentials with mercer as provider' do
        expect(project.hogan_provider).to eq('mercer')
      end
    end

    context 'default_provider is set as mercer in secrets' do
      before do
        allow(Settings.secrets.hogan).to receive(:default_provider).and_return('mercer')
      end

      it 'creates hogan credentials with mercer as provider' do
        expect(project.hogan_provider).to eq('mercer')
      end
    end
  end

  describe 'after_create callbacks' do
    context 'when client is a root tenancy' do
      it 'creates a design setting' do
        tenancy = create(:tenancy)
        expect(tenancy.design_setting).to be_present
      end

      it 'creates a design setting for each project' do
        tenancy = create(:tenancy)
        project = create(:project, parent: tenancy)
        expect(project.design_setting).to be_present
      end
    end
  end
end
