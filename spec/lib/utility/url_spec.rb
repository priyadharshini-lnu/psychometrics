# frozen_string_literal: true

require 'rails_helper'

describe Utility::Url do
  describe '.match?' do
    it 'remove all the params passed in the array' do
      url = described_class.remove_query_params('/path?q1=v1&q2=v2&q3=v3', %w[q1 q3])

      expect(url).to eq('/path?q2=v2')
    end

    it 'works with single query params' do
      url = described_class.remove_query_params('/path?q1=v1&q2=v2&q3=v3', 'q1')

      expect(url).to eq('/path?q2=v2&q3=v3')
    end

    it "doesn't do anything if there is no query parameter in the url" do
      url = described_class.remove_query_params('/path', 'q1')

      expect(url).to eq('/path')
    end
  end
end
