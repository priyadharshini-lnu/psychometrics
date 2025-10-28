# frozen_string_literal: true

require 'ipaddr'

# Copied from https://github.com/rails/rails/commit/2d084af8444a7b6b868c7cbb256172007871e78d.
# Remove it after we move to rails 8.1.0.
module ActionDispatch
  class RemoteIp
    class GetIp
      def calculate_ip
        remote_addr = sanitize_ips(ips_from(@req.remote_addr)).last

        client_ips    = sanitize_ips(ips_from(@req.client_ip)).reverse!
        forwarded_ips = sanitize_ips(@req.forwarded_for || []).reverse!

        should_check_ip = @check_ip && client_ips.last && forwarded_ips.last
        if should_check_ip && forwarded_ips.exclude?(client_ips.last)

          raise IpSpoofAttackError, 'IP spoofing attack?! ' \
                                    "HTTP_CLIENT_IP=#{@req.client_ip.inspect} " \
                                    "HTTP_X_FORWARDED_FOR=#{@req.x_forwarded_for.inspect}"
        end

        ips = forwarded_ips + client_ips
        ips.compact!

        filter_proxies(ips + [remote_addr]).first || ips.last || remote_addr
      end

      private

      def ips_from(header)
        return [] unless header

        header.strip.split(/[,\s]+/)
      end

      def sanitize_ips(ips)
        ips.select! do |ip|
          range = IPAddr.new(ip).to_range
          range.begin == range.end
        rescue ArgumentError
          nil
        end
        ips
      end
    end
  end
end
