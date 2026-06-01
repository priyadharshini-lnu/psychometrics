# frozen_string_literal: true

# Configure activerecord-session_store to use our Session model
# Use to_prepare to ensure the model is loaded (works in both dev and production)
Rails.application.config.to_prepare do
  ActionDispatch::Session::ActiveRecordStore.session_class = Session
end
