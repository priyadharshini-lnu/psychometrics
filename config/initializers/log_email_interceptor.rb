# frozen_string_literal: true

require './app/mailers/interceptors/log_email_interceptor'

ActionMailer::Base.register_interceptor(Interceptors::LogEmailInterceptor)
