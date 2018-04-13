Rack::Timeout.service_timeout = Rails.application.secrets.rack_timeout[:service_timeout]
Rack::Timeout.wait_timeout = Rails.application.secrets.rack_timeout[:wait_timeout]
Rack::Timeout.wait_overtime = Rails.application.secrets.rack_timeout[:wait_overtime]
Rack::Timeout.service_past_wait = Rails.application.secrets.rack_timeout[:service_past_wait]
