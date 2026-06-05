# frozen_string_literal: true

module ViteTestHelper
  def mock_vite_assets
    allow_any_instance_of(ActionView::Base).to receive(:vite_javascript_tag).and_return('')
    allow_any_instance_of(ActionView::Base).to receive(:vite_stylesheet_tag).and_return('')
    allow_any_instance_of(ActionView::Base).to receive(:javascript_include_tag).and_return('')
  end
end

RSpec.configure do |config|
  config.include ViteTestHelper, type: :controller

  config.before(:each, type: :controller) do
    mock_vite_assets
  end
end
