# frozen_string_literal: true

BrowserDetections = Struct.new(:supported_browser?, :preferred_browser?, :name)

class BrowserDetector
  def detect(browser)
    BrowserDetections.new(
      supported_browser?(browser),
      preferred_browser?(browser),
      browser.name
    )
  end

  def supported_browser?(browser)
    [
      browser.chrome?(Settings.browsers.supported.chrome),
      browser.firefox?(Settings.browsers.supported.firefox),
      browser.edge?(Settings.browsers.supported.edge),
      browser.safari?(Settings.browsers.supported.safari),
      browser.opera?(Settings.browsers.supported.opera)
    ].any?
  end

  def preferred_browser?(browser)
    [
      browser.chrome?(Settings.browsers.preferred.chrome),
      browser.firefox?(Settings.browsers.preferred.firefox),
      browser.edge?(Settings.browsers.preferred.edge)
    ].any?
  end
end
