# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MaintenanceSetting, type: :model do
  describe 'enums' do
    it { should define_enum_for(:sub_system).with_values(proctoring: 1) }
  end

  describe 'create' do
    it 'creates a maintenance setting with all required fields' do
      maintenance_setting = create(:maintenance_setting,
                                   sub_system: :proctoring,
                                   maintenance_window_enabled: true,
                                   time_zone: 'Asia/Kolkata',
                                   start_time: Time.current,
                                   end_time: 1.hour.from_now)

      expect(maintenance_setting).to be_persisted
      expect(maintenance_setting.sub_system).to eq('proctoring')
      expect(maintenance_setting.maintenance_window_enabled).to be true
    end

    it 'raises error when creating without required fields' do
      expect do
        MaintenanceSetting.create!(sub_system: nil, maintenance_window_enabled: false)
      end.to raise_error(ActiveRecord::NotNullViolation)
    end
  end

  describe 'update' do
    let(:maintenance_setting) { create(:maintenance_setting) }

    it 'updates maintenance setting with valid attributes' do
      new_start_time = Time.current
      new_end_time = 2.hours.from_now

      maintenance_setting.update!(
        start_time: new_start_time,
        end_time: new_end_time,
        time_zone: 'America/New_York'
      )

      expect(maintenance_setting.reload.time_zone).to eq('America/New_York')
      expect(maintenance_setting.start_time).to be_within(1.second).of(new_start_time)
      expect(maintenance_setting.end_time).to be_within(1.second).of(new_end_time)
    end

    it 'raises error when updating required fields to null' do
      expect do
        maintenance_setting.update_column(:time_zone, nil)
      end.to raise_error(ActiveRecord::NotNullViolation)
    end
  end
end
