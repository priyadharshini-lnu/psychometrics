# frozen_string_literal: true

ActionMailer::Base.register_interceptor(Interceptors::LogEmailInterceptor)
