class PushNotificationsController < ApplicationController
  def create
    Rails.logger.info "Sending push notification from #{push_params.inspect}"
    subscription_params = fetch_subscription_params

    send_message fetch_message,
      endpoint: subscription_params[:endpoint],
      p256dh: subscription_params.dig(:keys, :p256dh),
      auth: subscription_params.dig(:keys, :auth)

    head :ok
  end

  def send_message(message, params)
    client = WebpushClient.new

    log("sending #{message} to #{params[:endpoint]}")
    response = client.send_notification(message, params)
    log(response ? "success" : "failed")
    log(response.body.inspect)
  end

  def log(message)
    Rails.logger.info("[WebpushClient] #{message}")
  end



  private

  def push_params
    params.permit(:message, { subscription: [:endpoint, keys: [:auth, :p256dh]]})
  end

  def fetch_message
    # push_params.fetch(:message, "Yay, you sent a push notification!")
    'this is a new message'
  end

  def fetch_subscription_params
    @subscription_params ||= push_params.fetch(:subscription) { extract_session_subscription }
  end

  def extract_session_subscription
    subscription = session.fetch(:subscription) { raise PushNotificationError,
                                                          "Cannot create notification: no :subscription in params or session" }

    JSON.parse(subscription).with_indifferent_access
  end
end
