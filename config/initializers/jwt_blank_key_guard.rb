# frozen_string_literal: true

# Monkey-patch JWT.decode to guard against CVE-2026-45363
#
# The jwt gem (< 3.2.0) accepts forged tokens when the HMAC secret key is empty/nil.
# This patch raises an explicit error if a blank key is passed with verification enabled,
# closing the vulnerability at the library level.
#
# Remove this patch once we can upgrade to jwt >= 3.2.0 (requires oci gem update)
#
module JwtBlankKeyGuard
  class BlankSecretError < JWT::DecodeError
    def initialize(msg = 'JWT secret key cannot be blank (CVE-2026-45363 mitigation)')
      super
    end
  end

  def decode(*args, **kwargs, &keyfinder)
    key = kwargs.key?(:key) ? kwargs[:key] : args[1]
    verify = if kwargs.key?(:verify)
               kwargs[:verify]
             else
               (args.length > 2 ? args[2] : true)
             end

    validate_key_not_blank!(key) if verify && !keyfinder

    validated_keyfinder = wrap_keyfinder_with_validation(keyfinder, verify)

    super(*args, **kwargs, &validated_keyfinder)
  end

  private

  def validate_key_not_blank!(key)
    raise BlankSecretError if key.to_s.strip.empty?
  end

  def wrap_keyfinder_with_validation(keyfinder, verify)
    return keyfinder unless verify && keyfinder

    proc do |*finder_args|
      resolved_key = keyfinder.call(*finder_args)
      validate_key_not_blank!(resolved_key)
      resolved_key
    end
  end
end

JWT.singleton_class.prepend(JwtBlankKeyGuard)
