# frozen_string_literal: true

BrowserDetections = Struct.new(:supported_browser?, :preferred_browser?)

class BrowserDetector
  def detect(browser)
    BrowserDetections.new(supported_browser?(browser), preferred_browser?(browser))
  end

  def supported_browser?(browser)
    [
      browser.chrome?('>= 53'),
      browser.firefox?('>= 36'),
      browser.edge?('>= 12'),
      browser.safari?('>= 11'),
      browser.opera?('>= 40')
    ].any?
  end

  def preferred_browser?(browser)
    [
      browser.chrome?('>= 53'),
      browser.firefox?('>= 42'),
      browser.edge?('>= 79')
    ].any?
  end
end
