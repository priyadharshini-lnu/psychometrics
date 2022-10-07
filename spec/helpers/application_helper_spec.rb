# frozen_string_literal: true

require 'spec_helper'

describe ApplicationHelper do
  describe '#background_images' do
    it 'returns an array of 7 image paths' do
      images = helper.background_images

      expect(images).to be_a(Array)
      expect(images.size).to eq(7)
    end

    it 'returns images in sequence with path' do
      image = helper.background_images.first

      expect(image).to be_a(String)
      expect(image).to match('administration/backgrounds/lh-background-0.png')
    end
  end

  describe '#randomized_background_image' do
    it 'returns expected image path' do
      image = helper.randomized_background_image
      expected_image_path = "administration/backgrounds/lh-background-#{Time.zone.today.day % 7}.png"

      expect(image).to satisfy('is of expected format') { |p| expected_image_path.match?(p) }
    end
  end
end
