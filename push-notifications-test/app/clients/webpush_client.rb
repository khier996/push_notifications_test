class WebpushClient
  # Send webpush message using subscription parameters
  #
  # @param message [String] text to encrypt
  # @param subscription_params [Hash<Symbol, String>]
  # @option subscription_params [String] :endpoint url to send encrypted message
  # @option subscription_params [Hash<Symbol, String>] :keys auth keys to send with message for decryption
  # @return true/false
  def send_notification(product_title, image, url, parameters)
    endpoint, p256dh, auth = parameters.values_at(:endpoint, :p256dh, :auth)

    raise ArgumentError, ":endpoint param is required" if endpoint.blank?
    raise ArgumentError, "subscription :keys are missing" if p256dh.blank? || auth.blank?

    Rails.logger.info("Sending WebPush notification...............")
    Rails.logger.info("message: #{product_title}")
    Rails.logger.info("endpoint: #{endpoint}")
    Rails.logger.info("p256dh: #{p256dh}")
    Rails.logger.info("auth: #{auth}")

    Webpush.payload_send(
      message: {url: url, title: 'Check out our new product', body: product_title, icon: image}.to_json,
      endpoint: endpoint,
      p256dh: p256dh,
      auth: auth,
      vapid: {
        public_key: public_key,
        private_key: private_key
      }
    )
  end

  def public_key
    ENV.fetch('VAPID_PUBLIC_KEY')
  end

  def private_key
    ENV.fetch('VAPID_PRIVATE_KEY')
  end
end

