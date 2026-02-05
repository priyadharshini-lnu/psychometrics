# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationConfigurationLoggable, type: :model do
  # Setup temporary table and model
  before(:all) do
    ActiveRecord::Schema.define do
      create_table :test_configurable_models, force: true do |t|
        t.string :name
        t.string :api_key
        t.string :password
        t.string :description
        t.string :email
        t.string :user_name
        t.string :from_email
        t.string :from_name
        t.integer :project_id
        t.timestamps
      end

      create_table :test_limited_configurable_models, force: true do |t|
        t.string :name
        t.string :description
        t.timestamps
      end
    end
  end

  after(:all) do
    ActiveRecord::Schema.define do
      drop_table :test_configurable_models
      drop_table :test_limited_configurable_models
    end
  end

  let(:test_model_class) do
    Class.new(ApplicationRecord) do
      self.table_name = 'test_configurable_models'
      include ApplicationConfigurationLoggable

      def project
        Struct.new(:id, :name).new(123, 'Test Project')
      end

      def self.name
        'TestConfigurableModel'
      end
    end
  end

  let(:limited_model_class) do
    Class.new(ApplicationRecord) do
      self.table_name = 'test_limited_configurable_models'
      include ApplicationConfigurationLoggable

      monitored_configuration_attributes :description

      def self.name
        'TestLimitedConfigurableModel'
      end
    end
  end

  let(:performer) { create(:user) }

  before do
    allow(Current).to receive(:user).and_return(performer)
    allow(SiemLogger).to receive(:log_security_event!)
    stub_const('TestConfigurableModel', test_model_class)
    stub_const('TestLimitedConfigurableModel', limited_model_class)
  end

  describe '#log_application_configuration_change_event' do
    context 'when creating a record' do
      it 'logs the creation event with all attributes' do
        TestConfigurableModel.create(name: 'New Config', description: 'Desc')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: 'Project: Test Project (123)',
          msg: "TestConfigurableModel Created: Name changed from 'nil' to 'New Config', " \
               "Description changed from 'nil' to 'Desc'"
        )
      end

      it 'redacts sensitive attributes on creation' do
        TestConfigurableModel.create(name: 'Secret', api_key: '12345', password: 'secretpass')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: satisfy do |m|
            m.include?('Api key changed') &&
              m.include?('Password changed') &&
              m.exclude?('12345') &&
              m.exclude?('secretpass')
          end
        )
      end
    end

    context 'when updating a record' do
      let(:record) { TestConfigurableModel.create(name: 'Old Name', description: 'Old Desc') }

      it 'logs changes to monitored attributes' do
        record.update(name: 'New Name')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: "TestConfigurableModel Updated: Name changed from 'Old Name' to 'New Name'"
        )
      end

      it 'ignores attributes that did not change' do
        record.update(name: 'Old Name') # No change
        expect(SiemLogger).not_to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          hash_including(msg: a_string_starting_with('TestConfigurableModel Updated'))
        )
      end

      it 'redacts sensitive updates' do
        record.update(api_key: 'new-key')

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: 'TestConfigurableModel Updated: Api key changed'
        )
      end
    end

    context 'when destroying a record' do
      let!(:record) { TestConfigurableModel.create(name: 'To delete') }

      it 'logs the destruction event' do
        record.destroy

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: a_string_starting_with("TestConfigurableModel Deleted for ID: #{record.id}")
        )
      end
    end

    context 'with monitored_configuration_attributes' do
      let(:record) { TestLimitedConfigurableModel.create(name: 'Ignore Me', description: 'Monitor Me') }

      it 'logs changes only to monitored attributes' do
        record.update(name: 'New Name', description: 'New Description')

        # Should only log description change
        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything, # No context defined for this model, handles "Unknown Context"
          msg: "TestLimitedConfigurableModel Updated: Description changed from 'Monitor Me' to 'New Description'"
        )
      end
    end

    context 'when SIEM logging is disabled globally' do
      before do
        allow(Settings).to receive(:features).and_return(double(disable_siem_logging: true))
      end

      it 'does not log' do
        TestConfigurableModel.create(name: 'config')
        expect(SiemLogger).not_to have_received(:log_security_event!)
      end
    end

    context 'when dont_send_pi_to_siem is true' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      end

      it 'redacts email, user_name, from_email, and from_name' do
        TestConfigurableModel.create(
          email: 'test@example.com',
          user_name: 'admin',
          from_email: 'sender@example.com',
          from_name: 'Sender'
        )

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: satisfy do |m|
            m.include?('Email changed') &&
              m.include?('User name changed') &&
              m.include?('From email changed') &&
              m.include?('From name changed') &&
              m.exclude?('test@example.com') &&
              m.exclude?('admin') &&
              m.exclude?('sender@example.com') &&
              m.exclude?('Sender')
          end
        )
      end
    end

    context 'when dont_send_pi_to_siem is false' do
      before do
        allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(false)
      end

      it 'logs email and user_name in plain text' do
        TestConfigurableModel.create(
          email: 'test@example.com',
          user_name: 'admin',
          from_email: 'sender@example.com',
          from_name: 'Sender'
        )

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'ApplicationConfigurationChange',
          actor_name: anything,
          context: anything,
          msg: satisfy do |m|
            m.include?("Email changed from 'nil' to 'test@example.com'") &&
              m.include?("User name changed from 'nil' to 'admin'") &&
              m.include?("From email changed from 'nil' to 'sender@example.com'") &&
              m.include?("From name changed from 'nil' to 'Sender'")
          end
        )
      end
    end
  end
end
