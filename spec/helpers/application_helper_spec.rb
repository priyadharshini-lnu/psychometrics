# frozen_string_literal: true

require 'spec_helper'

describe ApplicationHelper do
  include ActiveSupport::Testing::TimeHelpers

  describe '#random_background' do
    it 'serves the auth background set' do
      travel_to(Time.zone.local(2026, 7, 10)) do
        expect(helper.random_background).to include('administration/backgrounds/lh-auth-background-3')
      end
    end
  end

  describe '#auth_background_image' do
    it 'returns expected image path' do
      image = helper.auth_background_image
      expected_image_path = "administration/backgrounds/lh-auth-background-#{Time.zone.today.day % 7}.jpg"

      expect(image).to satisfy('is of expected format') { |p| expected_image_path.match?(p) }
    end

    it 'rotates by day of month' do
      travel_to(Time.zone.local(2026, 7, 10)) do
        expect(helper.auth_background_image).to eq('administration/backgrounds/lh-auth-background-3.jpg')
      end
    end

    it 'wraps back to the first image every 7 days' do
      travel_to(Time.zone.local(2026, 7, 7)) do
        expect(helper.auth_background_image).to eq('administration/backgrounds/lh-auth-background-0.jpg')
      end
    end
  end
end
