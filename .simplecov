unless ENV['DISABLE_COVERAGE']
  require 'coveralls'
  Coveralls.wear!('rails')

  SimpleCov.start 'rails' do
    formatter = SimpleCov::Formatter::MultiFormatter.new([
      SimpleCov::Formatter::HTMLFormatter,
      Coveralls::SimpleCov::Formatter
    ])
  end
end
