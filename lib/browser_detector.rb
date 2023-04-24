# frozen_string_literal: true

BrowserDetections = Struct.new(:supported_browser?, :preferred_browser?, :name)

class BrowserDetector
  attr_accessor :supported_browsers, :preferred_browsers

  Browsers = Struct.new(:chrome, :firefox, :edge, :safari, :opera, :examus)
  def initialize(config = nil)
    @supported_browsers = config&.supported || Browsers.new('>= 67', '>= 54', '>= 16', '>= 11.1', '>= 54', '>= 1')
    @preferred_browsers = config&.preferred || Browsers.new('>= 67', '>= 54', '>= 16')
  end

  def detect(browser)
    BrowserDetections.new(
      supported_browser?(browser),
      preferred_browser?(browser),
      browser.name
    )
  end

  def supported_browser?(browser)
    [
      browser.chrome?(supported_browsers.chrome),
      browser.firefox?(supported_browsers.firefox),
      browser.edge?(supported_browsers.edge),
      browser.safari?(supported_browsers.safari),
      browser.opera?(supported_browsers.opera),
      browser.instance_of?(::Browsers::Examus)
    ].any?
  end

  def preferred_browser?(browser)
    [
      browser.chrome?(preferred_browsers.chrome),
      browser.firefox?(preferred_browsers.firefox),
      browser.edge?(preferred_browsers.edge)
    ].any?
  end
end
