# frozen_string_literal: true

Rack::Timeout.service_timeout = Settings.secrets.rack_timeout[:service_timeout]
Rack::Timeout.wait_timeout = Settings.secrets.rack_timeout[:wait_timeout]
Rack::Timeout.wait_overtime = Settings.secrets.rack_timeout[:wait_overtime]
Rack::Timeout.service_past_wait = Settings.secrets.rack_timeout[:service_past_wait]
