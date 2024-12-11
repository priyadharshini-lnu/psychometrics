# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Utility::SanitizeHtml do
  let(:html) { '<div><b>Bold Text</b><script>("XSS")</script></div>' }

  it 'sanitizes html' do
    sanitized_html = described_class.process(html)
    expect(sanitized_html).to eq("<div>\n<b>Bold Text</b>(\"XSS\")\n</div>")
  end
end
