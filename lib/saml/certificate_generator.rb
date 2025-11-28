# frozen_string_literal: true

module Saml
  class CertificateGenerator
    class << self
      def generate_self_signed_certificate
        # Generate a new RSA key pair
        private_key = OpenSSL::PKey::RSA.new(2048)

        # Create a new certificate
        certificate = OpenSSL::X509::Certificate.new
        certificate.version = 2
        certificate.serial = generate_serial_number
        certificate.subject = certificate.issuer = generate_subject
        certificate.public_key = private_key.public_key
        certificate.not_before = Time.current
        certificate.not_after = certificate.not_before + 10.years

        # Add extensions
        extension_factory = OpenSSL::X509::ExtensionFactory.new
        extension_factory.subject_certificate = certificate
        extension_factory.issuer_certificate = certificate

        certificate.add_extension(extension_factory.create_extension('basicConstraints', 'CA:FALSE', true))
        certificate.add_extension(extension_factory.create_extension('keyUsage', 'digitalSignature,keyEncipherment',
                                                                     true))
        certificate.add_extension(extension_factory.create_extension('subjectKeyIdentifier', 'hash', false))

        # Self-sign the certificate
        certificate.sign(private_key, OpenSSL::Digest.new('SHA256'))

        {
          certificate: certificate.to_pem,
          private_key: private_key.to_pem
        }
      end

      private

      def generate_serial_number
        # Generate a random serial number
        SecureRandom.random_number(2**159)
      end

      def generate_subject
        # Create a distinguished name for the certificate
        OpenSSL::X509::Name.parse('/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=SAML IDP')
      end
    end
  end
end
