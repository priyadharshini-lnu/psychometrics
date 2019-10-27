# frozen_string_literal: true

Capybara.default_max_wait_time = 10

Capybara.register_driver :chrome do |app|
  client = Selenium::WebDriver::Remote::Http::Default.new
  client.read_timeout = 120
  profile = Selenium::WebDriver::Chrome::Profile.new
  profile['download.default_directory'] = DownloadHelpers::PATH.to_s
  Capybara::Selenium::Driver.new(app, browser: :chrome, http_client: client, profile: profile)
end

Capybara.register_driver :headless_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-gpu')
  options.add_argument('--disable-popup-blocking')
  options.add_argument('--window-size=1366,768')

  driver = Capybara::Selenium::Driver.new(app, browser: :chrome, options: options).tap do |d|
    d.browser.download_path = DownloadHelpers::PATH.to_s
  end

  driver
end

Capybara::Screenshot.register_driver(:chrome) do |driver, path|
  driver.browser.save_screenshot(path)
end

Capybara::Screenshot.register_driver(:headless_chrome) do |driver, path|
  driver.browser.save_screenshot(path)
end

Capybara.configure do |c|
  c.app_host = "http://lvh.me:#{Settings.port}"
  c.server_port = Settings.port
end

driver = ENV['CHROME_VISIBLE_MODE'] ? :chrome : :headless_chrome
Capybara.default_driver = Capybara.javascript_driver = driver
